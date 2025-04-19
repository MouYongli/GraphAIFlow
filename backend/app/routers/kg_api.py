from fastapi import APIRouter
from neo4j import GraphDatabase

router = APIRouter()

# Neo4j 连接配置（你可以用全局 driver 复用优化）
uri = "bolt://localhost:7687"
user = "neo4j"
password = "610766356Xzy"
driver = GraphDatabase.driver(uri, auth=(user, password))

@router.get("/kg/graph")
def get_kg_graph():
    with driver.session() as session:
        result = session.run("""
            MATCH (n)-[r]->(m)
            RETURN n, r, m LIMIT 100
        """)
        data = []
        for record in result:
            data.append({
                "source": record["n"].id,
                "source_label": list(record["n"].labels)[0],
                "source_name": record["n"].get("name", ""),
                "target": record["m"].id,
                "target_label": list(record["m"].labels)[0],
                "target_name": record["m"].get("name", ""),
                "relation": record["r"].type
            })
        return {"data": data}
