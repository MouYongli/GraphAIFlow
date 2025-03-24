from rdflib import Graph, RDF, RDFS, OWL
from rdflib import URIRef, Namespace
import os
import json
from rdflib.namespace import XSD

DEFAULT_NAMESPACE = Namespace("http://example.com/")


def clean_uri(uri):
    """清理 URI，去掉前缀，仅保留 ID"""
    if uri.startswith("file:/"):
        uri = uri.replace("file:/", "")  # 处理本地路径
    elif uri.startswith("http://") or uri.startswith("https://"):
        uri = uri.replace("http://", "").replace("https://", "")

    return uri.split("#")[-1] if "#" in uri else uri.split("/")[-1]



def parse_rdf_owl(file_path: str, file_format: str = None):
    """解析 RDF/OWL 文件，返回本体层次结构数据"""
    print(f"📂 正在解析: {file_path}")

    if not os.path.exists(file_path):
        print("❌ 文件不存在")
        return None

    # 自动检测格式
    if file_format is None:
        if file_path.endswith(".ttl"):
            file_format = "turtle"
        elif file_path.endswith(".rdf") or file_path.endswith(".owl"):
            file_format = "application/rdf+xml"
        else:
            print("❌ 不支持的文件格式")
            return None

    g = Graph()
    try:
        g.parse(file_path, format=file_format)
        print("✅ RDF/OWL 解析成功！")
    except Exception as e:
        print(f"❌ 解析失败: {e}")
        return None

    # 存储本体结构
    classes = set()
    subclass_relations = {}
    

    # **解析所有类**
    for s, p, o in g.triples((None, RDF.type, OWL.Class)):
        class_name = clean_uri(str(s))
        classes.add(class_name)
    for s, p, o in g.triples((None, RDF.type, RDFS.Class)):  # 兼容 RDFS Class
        classes.add(clean_uri(str(s)))

    # **解析类的层次结构**
    links = []  # ✅ 存储 `subClassOf` 关系
    for s, p, o in g.triples((None, RDFS.subClassOf, None)):
        child = clean_uri(str(s))
        parent = clean_uri(str(o))

        if parent == "Thing":
            continue  # ✅ 跳过连到 Thing 的 link

        if parent and child:
            links.append({"source": child, "target": parent, "type": "subClassOf"})

    # **解析对象属性 (ObjectProperty) 关系**
    object_properties = []

    for s, p, o in g.triples((None, RDF.type, OWL.ObjectProperty)):
        prop_name = clean_uri(str(s))  # 属性名

        # 获取所有 domain 和 range
        domains = set(g.objects(s, RDFS.domain))  # 可能有多个 domain
        ranges = set(g.objects(s, RDFS.range))  # 可能有多个 range

        # 遍历所有 domain 和 range 组合
        for domain in domains:
            for range_ in ranges:
                object_properties.append({
                    "name": prop_name,
                    "source": clean_uri(str(domain)),
                    "target": clean_uri(str(range_))
                })

    for s, p, o in g.triples((None, RDF.type, RDF.Property)):
        prop_name = clean_uri(str(s))
        domains = set(g.objects(s, RDFS.domain))
        ranges = set(g.objects(s, RDFS.range))

        if not domains:  # ✅ 处理 domain 为空的情况
            domains = {"UnknownDomain"}
        if not ranges:  # ✅ 处理 range 为空的情况
            ranges = {"UnknownRange"}

        for domain in domains:
            for range_ in ranges:
                object_properties.append({
                    "name": prop_name,
                    "source": clean_uri(str(domain)),
                    "target": clean_uri(str(range_))
                })

    print(f"🔎 解析到 {len(object_properties)} 个 ObjectProperty 关系")

    # **解析数据属性**
    data_properties = []

    # 处理 DataProperty 的部分
    for s, p, o in g.triples((None, RDF.type, OWL.DatatypeProperty)):
        prop_name = clean_uri(str(s))
        domains = set(g.objects(s, RDFS.domain))
        ranges = set(g.objects(s, RDFS.range))

        if not domains:
            domains = {"UnknownDomain"}
        if not ranges:
            ranges = {"string"}  # 默认 string 类型

        # 创建唯一的 target
        for domain in domains:
            for range_ in ranges:
                unique_target = f"{clean_uri(str(range_))}_{prop_name}_{domain}"

                # 确保唯一的节点
                if not any(dp["target"] == unique_target for dp in data_properties):
                    data_properties.append({
                        "name": prop_name,
                        "source": clean_uri(str(domain)),
                        "target": unique_target,
                        "rangeType": clean_uri(str(range_)),
                    })

# ✅ 补充处理 rdf:Property 类型中可能是 DataProperty 的情况
    for s, p, o in g.triples((None, RDF.type, RDF.Property)):
                prop_name = clean_uri(str(s))
                # ✅ 跳过已经出现在 OWL.DatatypeProperty 中的属性

                if not domains:
                    domains = {"UnknownDomain"}
                if not ranges:
                    ranges = {"string"}  # 默认 string

                # ✅ 判断是否是数据属性（基于 range 是 XSD 类型）
                is_data_property = any(
                    isinstance(r, URIRef) and (
                        str(r).startswith(str(XSD)) or
                        clean_uri(str(r)) in {"string", "float", "int", "boolean", "dateTime"}
                    ) for r in ranges
                )

                if is_data_property:
                    for domain in domains:
                        for range_ in ranges:
                            unique_target = f"{clean_uri(str(range_))}_{prop_name}_{clean_uri(str(domain))}"

                            # 避免重复添加
                            if not any(dp["name"] == prop_name and dp["source"] == clean_uri(str(domain)) for dp in data_properties):
                                data_properties.append({
                                    "name": prop_name,
                                    "source": clean_uri(str(domain)),
                                    "target": unique_target,
                                    "rangeType": clean_uri(str(range_)),
                                })

    
    

    # **构建 Ontology JSON**
    ontology_data = {
        "nodes": [{"id": cls, "name": cls, "type": "Class"} for cls in classes],
        "links": links,
        "object_properties": object_properties,
        "data_properties": list(data_properties),
        "classes": list(classes),  # ✅ 确保 classes 被返回
    }
    # 创建唯一的 RangeType 节点，确保每个 DataProperty 与 range 的组合都是独立的
    for dp in data_properties:
        ontology_data["nodes"].append({
        "id": dp["target"],
        "name": dp["rangeType"],  # ✅ 显示 string
        "type": "RangeType",
        "rawLabel": f"{dp['name']}@{dp['source']}",  # 👈 可作为 tooltip 展示
        })



    # **确保所有 links 里的 source 和 target 都在 nodes 里**
    all_nodes = set(classes)
    for link in links + object_properties:
        all_nodes.add(link["source"])
        all_nodes.add(link["target"])

    # 只有 `ontology_data` 存在时，才 append
    if "nodes" in ontology_data:
        for node_id in all_nodes:
            if node_id not in classes:
                ontology_data["nodes"].append({"id": node_id, "name": node_id, "type": "Unknown"})


    # **如果 "Thing" 作为根节点缺失，则补充**
    if "Thing" not in all_nodes:
        ontology_data["nodes"].append({"id": "Thing", "name": "Thing", "type": "Class"})

    

    print("\n=== 🔗 解析出的 links ===")
    for link in links:
        print(f"{link['source']} --{link['type']}--> {link['target']}")


    print(f"📊 解析完成: 类别 {len(classes)}, 关系 {len(links)}, 对象属性 {len(object_properties)}, 数据属性 {len(data_properties)}")
    print(json.dumps(ontology_data, indent=2, ensure_ascii=False))
    node_ids = {node["id"] for node in ontology_data["nodes"]}
    print("🔍 解析出的 Classes:", ontology_data["nodes"])
    print("🔍 解析出的 Object Properties:", ontology_data["object_properties"])


    return ontology_data


def detect_format(file_path: str):
    if file_path.endswith(".ttl"):
        return "turtle"
    elif file_path.endswith(".rdf") or file_path.endswith(".owl"):
        return "application/rdf+xml"
    return None


def add_class_to_graph(file_path: str, class_name: str, parent_class: str = None) -> bool:
    g = Graph()
    file_format = detect_format(file_path)
    if file_format is None:
        return False
    g.parse(file_path, format=file_format)

    new_class_uri = URIRef(f"http://example.com/{class_name}")
    g.add((new_class_uri, RDF.type, OWL.Class))

    if parent_class:
        parent_uri = URIRef(f"http://example.com/{parent_class}")
        g.add((new_class_uri, RDFS.subClassOf, parent_uri))

    g.serialize(destination=file_path, format=file_format)
    return True


def add_object_property_to_graph(file_path: str, prop_name: str, domain: str, range_: str) -> bool:
    g = Graph()
    file_format = detect_format(file_path)
    if file_format is None:
        return False
    g.parse(file_path, format=file_format)

    prop_uri = URIRef(f"http://example.com/{prop_name}")
    domain_uri = URIRef(f"http://example.com/{domain}")
    range_uri = URIRef(f"http://example.com/{range_}")

    g.add((prop_uri, RDF.type, OWL.ObjectProperty))
    g.add((prop_uri, RDFS.domain, domain_uri))
    g.add((prop_uri, RDFS.range, range_uri))

    g.serialize(destination=file_path, format=file_format)
    return True

def add_data_property_to_graph(file_path: str, prop_name: str, domain: str, range_: str) -> bool:
    """添加数据属性到图谱"""
    g = Graph()
    file_format = detect_format(file_path)
    
    if file_format is None:
        return False
    
    g.parse(file_path, format=file_format)

    prop_uri = URIRef(f"http://example.com/{prop_name}")
    domain_uri = URIRef(f"http://example.com/{domain}")
    range_uri = URIRef(f"http://example.com/{range_}")

    # 添加数据属性
    g.add((prop_uri, RDF.type, OWL.DatatypeProperty))
    g.add((prop_uri, RDFS.domain, domain_uri))
    g.add((prop_uri, RDFS.range, range_uri))

    # 将更新后的图谱保存
    g.serialize(destination=file_path, format=file_format)
    
    return True



def remove_class_from_graph(file_path: str, class_name: str) -> bool:
    try:
        g = Graph()
        g.parse(file_path)
        EX = Namespace("http://example.com/")
        class_uri = EX[class_name]

        # ✅ 删除 class 相关三元组
        for triple in list(g.triples((class_uri, None, None))):
            g.remove(triple)
        for triple in list(g.triples((None, None, class_uri))):
            g.remove(triple)

        # ✅ 删除其 rdf:type 和 subclass
        g.remove((class_uri, RDF.type, OWL.Class))
        g.remove((class_uri, RDFS.subClassOf, None))

        # ✅ 删除所有 DataProperty 相关（domain 指向该类）
        for s, p, o in list(g.triples((None, RDFS.domain, class_uri))):
            g.remove((s, RDF.type, OWL.DatatypeProperty))
            g.remove((s, RDFS.domain, class_uri))
            g.remove((s, RDFS.range, None))
            g.remove((s, RDFS.label, None))

        # ✅ 删除所有 ObjectProperty（domain 或 range 指向该类）
        for s, p, o in list(g.triples((None, RDFS.domain, class_uri))):
            g.remove((s, RDF.type, OWL.ObjectProperty))
            g.remove((s, RDFS.domain, class_uri))
            g.remove((s, RDFS.range, None))
        for s, p, o in list(g.triples((None, RDFS.range, class_uri))):
            g.remove((s, RDF.type, OWL.ObjectProperty))
            g.remove((s, RDFS.range, class_uri))
            g.remove((s, RDFS.domain, None))

        g.serialize(destination=file_path)
        return True
    except Exception as e:
        print(f"❌ 删除类失败: {e}")
        return False



def remove_object_property_from_graph(file_path: str, prop_name: str) -> bool:
    try:
        g = Graph()
        g.parse(file_path)
        EX = Namespace("http://example.com/")
        prop_uri = EX[prop_name]

        # 删除所有有关该 ObjectProperty 的三元组
        for triple in list(g.triples((prop_uri, None, None))):
            g.remove(triple)
        for triple in list(g.triples((None, None, prop_uri))):
            g.remove(triple)

        g.serialize(destination=file_path)
        return True
    except Exception as e:
        print(f"❌ 删除对象属性失败: {e}")
        return False


def remove_data_property_from_graph(file_path: str, prop_name: str) -> bool:
    try:
        g = Graph()
        g.parse(file_path)
        EX = Namespace("http://example.com/")
        prop_uri = EX[prop_name]

        # 删除所有有关该 DataProperty 的三元组
        for triple in list(g.triples((prop_uri, None, None))):
            g.remove(triple)
        for triple in list(g.triples((None, None, prop_uri))):
            g.remove(triple)

        g.serialize(destination=file_path)
        return True
    except Exception as e:
        print(f"❌ 删除数据属性失败: {e}")
        return False
