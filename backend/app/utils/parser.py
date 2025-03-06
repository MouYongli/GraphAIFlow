# backend/app/utils/parser.py
from rdflib import Graph, URIRef, Literal

def extract_label(uri: str) -> str:
    """
    提取 URI 的最后部分作为 label
    """
    if "#" in uri:
        return uri.split("#")[-1]
    elif "/" in uri:
        return uri.split("/")[-1]
    return uri

def parse_rdf_owl(file_path: str):
    """
    解析 RDF/OWL（TTL 格式）文件，返回图结构数据：
      {
         "nodes": [{ "id": string, "label": string, "type": string }, ...],
         "edges": [{ "source": string, "target": string, "label": string, "type": string }, ...]
      }
    """
    g = Graph()
    g.parse(file_path, format="turtle")  # 指定 TTL 格式解析

    nodes = {}
    edges = []

    RDFS_CLASS_URI = "http://www.w3.org/2000/01/rdf-schema#Class"
    RDF_TYPE_URI = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"

    # 第一遍：识别 rdf:type 为 rdfs:Class 的节点（标记为 class）
    for s, p, o in g:
        if p == URIRef(RDF_TYPE_URI) and str(o) == RDFS_CLASS_URI:
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
        # 宾语节点：如果为 Literal，则 type 为 literal；否则为 resource
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
        # 构造边：所有三元组均生成边，边的 label 取 p 的简化名
        edge = {
            "source": s_str,
            "target": o_str,
            "label": extract_label(p_str),
            "type": "relation"
        }
        edges.append(edge)

    return {
        "nodes": list(nodes.values()),
        "edges": edges
    }
