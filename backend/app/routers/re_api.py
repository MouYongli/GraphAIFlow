# backend/app/routers/recommendation_api.py

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
import requests
import json5
import re
from neo4j import GraphDatabase
from googletrans import Translator
from langdetect import detect

from dotenv import load_dotenv


translator = Translator()
load_dotenv()

def call_translation_llm(prompt: str) -> str:
    url = "http://ollama.warhol.informatik.rwth-aachen.de/api/chat"
    model = "deepseek-r1:7b"

    messages = [
        {"role": "system", "content": "你是一个专业翻译助手。"},
        {"role": "user", "content": prompt}
    ]

    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.1,
        "stream": False
    }

    try:
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()
        content = response.json()["message"]["content"].strip()

        #  Step 1：去掉 <think> 标签内容
        content = re.sub(r"<think>[\s\S]*?</think>", "", content, flags=re.IGNORECASE).strip()

        # Step 2：返回清洗后的全部内容
        return content if content else "[空响应]"


    except Exception as e:
        print("❌ 翻译失败：", e)
        return "[Translation failed]"


def translate_to_chinese_by_llm(text: str) -> str:
    prompt = (
        "You are a professional translator. If the following text is already in Chinese, return it as is. "
        "If it is in English or any other language, translate it to Chinese. "
        "Only return the result without explanation.\n\n"
        f"{text}"
    )
    return call_translation_llm(prompt)

def translate_to_english_by_llm(text: str) -> str:
    prompt = (
        "You are a professional translator. Translate the following Chinese text into fluent English. "
        "Only return the translation result. Do not include any Chinese, explanations or extra content.\n\n"
        f"{text}"
    )
    return call_translation_llm(prompt)



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
    translatedInput: str


def call_deepseek_llm(prompt: str, question: str) -> dict:
    url = "http://ollama.warhol.informatik.rwth-aachen.de/api/chat"
    model = "deepseek-r1:7b"

    #  设置默认 prompt（用户如果没输入，就用这个）
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

    try:
        response = requests.post(url, json=payload, timeout=90)
        response.raise_for_status()
    
        content = response.json()["message"]["content"]

        import re
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            return json5.loads(json_match.group())
        else:
            raise ValueError("未找到合法 JSON 内容")

    except Exception as e:
        print("❌ 模型调用失败：", e)
        return {
            "error": str(e),
            "raw": response.text if 'response' in locals() else "无响应"
        }

def sanitize_cypher(cypher: str) -> str:
    import re

    # 去除 markdown 包裹
    cypher = cypher.strip("` \n")

    # 🔥 清除中文标点
    cypher = re.sub(r"[。！？；：，、]", "", cypher)

    # 修复非法反向关系写法：
    # 格式 1: (a)<[:REL]->(b)
    cypher = re.sub(r'\((.*?)\)<\[:(.*?)\]->\((.*?)\)', r'(\3)-[:\2]->(\1)', cypher)
    # 格式 2: (a)<[:REL]>(b)
    cypher = re.sub(r'\((.*?)\)<\[:(.*?)\]>\((.*?)\)', r'(\3)-[:\2]->(\1)', cypher)
    

    cypher = cypher.strip()

    # 提取已使用的变量（a、r、e、t、cu、f）
    used_vars = set(re.findall(r'\b([aretcuf])\b', cypher))
    name_map = {
        "a": "a.name", "r": "r.name", "e": "e.name",
        "t": "t.name", "c": "c.name", "u": "cu.name", "f": "f.name"
    }

    # 仅保留实际在 MATCH 中出现的变量
    existing_vars = set(re.findall(r'\b(\w+)\s*:', cypher))  # 例如 a:TouristAttraction
    return_fields = [name_map[v] for v in used_vars if v in name_map and v in existing_vars]

    if "RETURN" not in cypher:
        cypher += "\nRETURN " + ", ".join(return_fields) if return_fields else "\nRETURN a.name"

    return cypher

def filter_cypher_blocks_by_entities(parsed: dict, cypher_lines: List[str]) -> List[str]:
    """
    根据解析出来的实体，仅保留与之相关的 Cypher 查询语句。
    """
    keep_keywords = []
    if "City" in parsed:
        keep_keywords += ["TouristAttraction", "Restaurant"]
    if "Time" in parsed:
        keep_keywords += ["Time"]
    if "ActivityAndExperience" in parsed:
        keep_keywords += ["ActivityAndExperience"]
    if "RecommendCuisine" in parsed:
        keep_keywords += ["RecommendCuisine"]
    if "ReviewAndFeedback" in parsed:
        keep_keywords += ["ReviewAndFeedback"]

    return [line for line in cypher_lines if any(k in line for k in keep_keywords)]



# 将其单独定义为一个 prompt 生成函数
def generate_cypher_by_llm(parsed: dict, question: str) -> str:
    #  防止 f-string 中 question 含有 `{}` 导致格式化错误
    safe_question = question.replace("{", "{{").replace("}", "}}")

    prompt = f"""
你是一个旅游知识图谱查询助手，目标是根据用户的问题和结构化信息，生成**严格符合本体结构、且尽可能宽松**的 Neo4j Cypher 查询语句。

【本体类别】
- City（城市）
- TouristAttraction（景点）
- Restaurant（餐厅）
- RecommendCuisine（美食）
- ActivityAndExperience（活动）
- ReviewAndFeedback（评论）
- Time（时间）

【关系定义】
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

【生成要求】
- 所有条件都必须使用 `OPTIONAL MATCH`，每一条结构化信息一条语句；
- ❗禁止将 city 信息作为实体属性使用，例如 ❌ (a:TouristAttraction {{city: "北京"}}) 是非法的；
-  城市只能通过 (a)-[:locatedIn]->(c:City {{name: "北京"}}) 来表达；
- 禁止生成未定义的节点标签（如 CityName、TimeName、Place、Spot 等）；
- 禁止出现语法错误，如 `))->(`、`))`、括号不匹配等；
- RETURN 子句必须统一写在最后，写成：`RETURN a.name, r.name, e.name, cu.name, t.name`，即所有常用节点的名称；
- 只输出纯 Cypher 查询语句，不要加注释、说明、格式包裹或 markdown；
- ❗重点强调：每条关系必须是你上面列出的 10 个关系中的一种，禁止自创关系！

【参考示例】
OPTIONAL MATCH (a:TouristAttraction)-[:locatedIn]->(c:City {{name: "北京"}})
OPTIONAL MATCH (r:Restaurant)-[:bestTimeToVisit]->(t:Time {{name: "春天"}})
RETURN a.name, r.name, e.name, cu.name, t.name
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
    # 清理不合法闭合括号（临时处理）
    content = content.replace(")->(", ")-[:locatedIn]->(").replace("))", ")")


    # 正则提取 Cypher 代码块
    import re
    cypher_block = re.findall(r'(?i)(MATCH .*?)(?=\n\n|\Z)', content, re.DOTALL)
    cypher_str = "\n".join(cypher_block)
    cypher_lines = cypher_str.splitlines()
    filtered_lines = filter_cypher_blocks_by_entities(parsed, cypher_lines)
    return sanitize_cypher("\n".join(filtered_lines)) if filtered_lines else "// 无匹配实体"

    
def generate_natural_response_by_llm(question: str, results: List[Dict]) -> str:
    url = "http://ollama.warhol.informatik.rwth-aachen.de/api/chat"
    model = "deepseek-r1:7b"

    # 只提取前几个实体名称
    names = []
    for record in results:
        for key in ["a.name", "r.name", "e.name", "cu.name", "t.name"]:
            if record.get(key) and record.get(key) not in names:
                names.append(record[key])
    names = names[:5]
    joined = "、".join(names)

    prompt = f"""
你是一个旅游推荐助手。用户提出了一个问题：“{question}”，系统从知识图谱中查询到了以下相关实体：
{joined}

请根据这些实体，组织一段简洁自然的推荐语句，风格友好、生活化，不需要太多解释，也不要列清单。

【输出要求】：
- 只输出一段自然语言推荐句；
- 推荐内容只能使用以上提取出的实体，不能发挥、不能扩展；
- 不加“以下是您推荐的内容”或“查询结果如下”；
- 不超过 50 个字，像朋友推荐那样自然。

只输出最终结果即可。
"""
    messages = [
        {"role": "system", "content": "你是一个旅游推荐助手，请生成简洁自然的推荐话术"},
        {"role": "user", "content": prompt}
    ]

    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.7,
        "stream": False
    }

    try:
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()
        content = response.json()["message"]["content"].strip()

        # 去除 <think> 标签内容（新增）
        content = re.sub(r"<think>[\s\S]*?</think>", "", content, flags=re.IGNORECASE).strip()

        # 提取最后一句非空文本行（可选，但建议加）
        lines = [line.strip() for line in content.splitlines() if line.strip()]
        return lines[-1] if lines else "这里有一些不错的地方值得一去～"

    except Exception as e:
        print("⚠️ 推荐语生成失败：", e)
        return "这里有一些不错的地方值得一去～"



@router.post("/api/recommend", response_model=RecommendResponse)
async def recommend(request: RecommendRequest):
    original_question = request.question
    is_chinese = detect(original_question).startswith("zh")
    is_english = detect(original_question) == "en"
    # 如果不是中文就翻译成中文
    question = translate_to_chinese_by_llm(original_question) if not is_chinese else original_question

    #  Step 2: 调用 LLM 抽取结构化信息
    parsed_info = call_deepseek_llm(request.prompt, question)

    if "error" in parsed_info:
        return RecommendResponse(
            parsed={},
            cypher="",
            graphResults=["模型接口错误：" + parsed_info["error"]],
            finalText="⚠️ 推荐失败：模型接口连接出错，请稍后再试。",
            translatedInput=original_question if is_english else ""  # 非英文不显示        
        )

    #  Step 3: 生成 Cypher 查询语句
    cypher_query = generate_cypher_by_llm(parsed_info, question).strip("`").strip()

    #  Step 4: 执行图查询
    try:
        result_records = run_cypher_query(cypher_query)
        graph_results = [str(record) for record in result_records]
    except Exception as e:
        print("Neo4j 查询失败：", e)
        result_records = []
        graph_results = ["查询失败"]

    #  Step 5: 生成推荐语句
    if not result_records:
        final_text = "暂时没有找到合适的推荐，换个关键词试试吧～"
    else:
        final_text = generate_natural_response_by_llm(original_question, result_records)

    # Step 6: 翻译推荐结果为英文（如果输入是英文）
    final_text_en = translate_to_english_by_llm(final_text) if not is_chinese else final_text

    print(" 翻译后文本：", question)
    print("📤 待翻译自然语言推荐语：", final_text)


    return RecommendResponse(
        parsed=parsed_info,
        cypher=cypher_query,
        graphResults=graph_results,
        finalText=final_text_en,
        translatedInput=question if is_english else ""  # 非英文不显示
    )
