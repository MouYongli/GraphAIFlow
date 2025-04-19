# backend/app/routers/recommendation_api.py

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
import requests
import json5
from neo4j import GraphDatabase

# 建立 Neo4j 驱动
neo4j_uri = "bolt://localhost:7687"   # 默认 Bolt 端口
neo4j_user = "neo4j"                  # 初始用户名
neo4j_password = "610766356Xzy"

driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))

def run_cypher_query(query: str) -> list:
    with driver.session() as session:
        result = session.run(query)
        return [dict(record) for record in result]
    
router = APIRouter()

# 请求体 schema
class RecommendRequest(BaseModel):
    question: str
    prompt: str

# 返回体 schema
class RecommendResponse(BaseModel):
    parsed: Dict
    cypher: str
    graphResults: List[str]
    finalText: str


def call_deepseek_llm(prompt: str, question: str) -> dict:
    url = "http://ollama.warhol.informatik.rwth-aachen.de/api/chat"
    model = "deepseek-r1:70b"

    # ✅ 设置默认 prompt（用户如果没输入，就用这个）
    if not prompt.strip():
        prompt = """你是一个结构化信息抽取助手，请从用户输入的旅游推荐问题中，提取关键实体，并按照下列类别分类：
        - City（城市）
        - TouristAttraction（景点）：如 故宫、颐和园
        - Restaurant（餐厅）：如 全聚德、海底捞
        - RecommendCuisine（美食）：如 烤鸭、麻辣烫
        - ActivityAndExperience（活动）：如 赏花、滑雪、夜游
        - ReviewAndFeedback（评论）：如 “评价很好”“评分高”
        - Time（时间）：如 春天、夏天、秋天、冬天

        【输出要求】：
        1. 请严格输出 JSON 格式；
        2. 禁止输出说明文字、禁止换行解释、禁止 <think> 标签；
        3. 只包含字段，无多余换行或解释性内容；
        4. 如果无法识别某类实体，可以不输出。

        【输出格式】（仅保留你识别到的部分）：
        {
            "City": "北京",
            "Time": "春天",
            "TouristAttraction": "景点"
        }

        请仅输出如上 JSON 内容，任何额外内容都会导致系统解析失败。
        """


    messages = [
        {"role": "system", "content": "请严格按照 JSON 格式返回实体类别映射"},
        {"role": "user", "content": f"{prompt}\n\n用户输入：{question}"}
    ]

    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.1,
        "stream": False
    }

    response = requests.post(url, json=payload)
    response.raise_for_status()

    content = response.json()["message"]["content"]

    try:
        import re
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            return json5.loads(json_match.group())
        else:
            raise ValueError("未找到合法 JSON 内容")
    except Exception as e:
        print("❌ 第一次解析失败，内容如下：\n", content)
        raise ValueError(f"解析失败：{e}\n原始内容：{content}")

def sanitize_cypher(cypher: str) -> str:
    # 去除 ``` 包裹
    cypher = cypher.strip("` \n")
    # 确保结尾包含 RETURN 子句
    if "RETURN" not in cypher:
        cypher += "\nRETURN a.name"  # 最基础默认
    return cypher.strip()


# 将其单独定义为一个 prompt 生成函数
def generate_cypher_by_llm(parsed: dict, question: str) -> str:
    #  防止 f-string 中 question 含有 `{}` 导致格式化错误
    safe_question = question.replace("{", "{{").replace("}", "}}")

    prompt = f"""
你是一个旅游知识图谱查询助手，目标是根据用户的问题和结构化信息，生成**尽可能宽松**的 Neo4j Cypher 查询语句。

【本体类别】
- City（城市）
- TouristAttraction（景点）
- Restaurant（餐厅）
- RecommendCuisine（美食）
- ActivityAndExperience（活动）
- ReviewAndFeedback（评论）
- Time（时间）

【对象关系定义】
1. (a:TouristAttraction)-[:locatedIn]->(c:City)
2. (r:Restaurant)-[:locatedIn]->(c:City)
3. (r:Restaurant)-[:hasRecommendCuisine]->(cu:RecommendCuisine)
4. (r:Restaurant)-[:hasActivityExperience]->(e:ActivityAndExperience)
5. (a:TouristAttraction)-[:hasActivityExperience]->(e:ActivityAndExperience)
6. (e:ActivityAndExperience)-[:isHeldOn]->(t:Time)
7. (a:TouristAttraction)-[:bestTimeToVisit]->(t:Time)
8. (r:Restaurant)-[:bestTimeToVisit]->(t:Time)
9. (a:TouristAttraction)-[:hasReviewAndFeedback]->(f:ReviewAndFeedback)
10. (r:Restaurant)-[:hasReviewAndFeedback]->(f:ReviewAndFeedback)

【用户原始问题】
"{safe_question}"

【结构化抽取结果】
{json5.dumps(parsed, ensure_ascii=False)}

【输出要求】
- 仅输出 Cypher 查询语句（不加解释、注释、markdown 格式）；
- 查询必须以 `RETURN` 子句结尾；
- 若存在多个实体类别，请使用 `OPTIONAL MATCH` 连接查询，避免因某些条件缺失而查询失败；
- 属性筛选请使用结构化信息（如 `{{name: "xx"}}`）；
- 返回值建议包括所有变量的 `.name` 字段，便于展示；
- 若无有效条件，也必须写出基础 MATCH 和 RETURN 结构。

【示例】
OPTIONAL MATCH (a:TouristAttraction)-[:locatedIn]->(c:City {{name: "北京"}})
OPTIONAL MATCH (r:restaurant)-[:locatedIn]->(c:city{{name: "北京"}})
RETURN a.name, t.name

"""


    messages = [
        {"role": "system", "content": "你是一个旅游图谱查询助手，请返回合法的 Cypher 查询语句，不要输出多余文字"},
        {"role": "user", "content": prompt}
    ]

    payload = {
        "model": "deepseek-r1:7b",
        "messages": messages,
        "temperature": 0.1,
        "stream": False
    }

    response = requests.post("http://ollama.warhol.informatik.rwth-aachen.de/api/chat", json=payload)
    response.raise_for_status()
    content = response.json()["message"]["content"]
        # 强制清除 markdown ``` 包裹
    content = content.replace("```cypher", "").replace("```", "").strip()


    # 正则提取 Cypher 代码块
    import re
    cypher_block = re.findall(r'(?i)(MATCH .*?)(?=\n\n|\Z)', content, re.DOTALL)
    return sanitize_cypher("\n".join(cypher_block)) if cypher_block else "// 未生成有效查询语句"


@router.post("/api/recommend", response_model=RecommendResponse)
async def recommend(request: RecommendRequest):
    parsed_info = call_deepseek_llm(request.prompt, request.question)
    cypher_query = generate_cypher_by_llm(parsed_info, request.question)
    cypher_query = cypher_query.strip('`').strip()

    # 真正执行 Cypher 查询
    try:
        result_records = run_cypher_query(cypher_query)
        graph_results = [str(record) for record in result_records]
    except Exception as e:
        print("Neo4j 查询失败：", e)
        graph_results = ["查询失败"]
    
    # 自动生成推荐语
    if not result_records:
        final_text = "暂时没有找到合适的推荐，换个关键词试试吧～"
    else:
        names = [record.get("a.name") or record.get("r.name") or record.get("e.name") for record in result_records]
        unique_names = list(set(filter(None, names)))
        joined_names = "、".join(unique_names[:5]) 
        final_text = f"在北京，不妨去看看：{joined_names}。希望你旅途愉快！"


    return RecommendResponse(
        parsed=parsed_info,
        cypher=cypher_query,
        graphResults=graph_results,
        finalText=final_text
    )
