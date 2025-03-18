from rdflib import Graph, RDF, RDFS, OWL
import os
import json

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
    data_properties = set()
    for s, p, o in g.triples((None, RDF.type, OWL.DatatypeProperty)):
        data_properties.add(clean_uri(str(s)))


    # **构建 Ontology JSON**
    ontology_data = {
        "nodes": [{"id": cls, "name": cls, "type": "Class"} for cls in classes],
        "links": links,
        "object_properties": object_properties,
        "data_properties": list(data_properties),
        "classes": list(classes),  # ✅ 确保 classes 被返回
    }


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
