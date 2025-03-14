from rdflib import Graph, URIRef, Literal
from rdflib.namespace import RDF, RDFS, OWL
import os

def extract_label(uri: str) -> str:
    """提取 URI 的最后部分作为 label"""
    if "#" in uri:
        return uri.split("#")[-1]
    elif "/" in uri:
        return uri.split("/")[-1]
    return uri

def parse_rdf_owl(file_path: str, file_format: str = None):
    """解析 RDF/OWL 文件，返回图结构数据"""
    
    # 打印接收到的文件路径
    print(f"📂 收到解析请求: {file_path}")

    if not os.path.exists(file_path):
        print("❌ 文件不存在")
        return None

    # 根据文件后缀判断解析格式
    if file_format is None:
        if file_path.endswith(".ttl"):
            file_format = "turtle"
        elif file_path.endswith(".rdf") or file_path.endswith(".owl"):
            file_format = "application/rdf+xml"
        else:
            print("❌ 不支持的文件格式")
            return None
    
    print(f"📂 解析格式: {file_format}")

    g = Graph()

    # 解析文件，增加异常捕获
    try:
        g.parse(file_path, format=file_format)
        print("✅ RDF/OWL 解析成功！")
    except Exception as e:
        print(f"❌ 解析失败: {e}")
        return None

    nodes = {}
    edges = []

    # 识别 rdf:type 为 rdfs:Class 或 owl:Class 的节点
    for s, p, o in g:
        if p == RDF.type and (o == RDFS.Class or o == OWL.Class):
            nodes[str(s)] = {
                "id": str(s),
                "label": extract_label(str(s)),
                "type": "class"
            }

    # 遍历所有三元组，构建节点和边
    for s, p, o in g:
        s_str = str(s)
        p_str = str(p)
        o_str = str(o)

        # 主语节点
        if s_str not in nodes:
            nodes[s_str] = {
                "id": s_str,
                "label": extract_label(s_str),
                "type": "resource"
            }

        # 宾语节点
        if isinstance(o, Literal):
            if o_str not in nodes:
                nodes[o_str] = {
                    "id": o_str,
                    "label": o_str,
                    "type": "literal"
                }
        else:
            if o_str not in nodes:
                nodes[o_str] = {
                    "id": o_str,
                    "label": extract_label(o_str),
                    "type": "resource"
                }

        # 生成边
        edge = {
            "source": s_str,
            "target": o_str,
            "label": extract_label(p_str),
            "type": "relation"
        }
        edges.append(edge)

    print(f"📊 解析完成，节点数: {len(nodes)}, 关系数: {len(edges)}")  # 输出解析的节点和边数

    return {"nodes": list(nodes.values()), "edges": edges}
