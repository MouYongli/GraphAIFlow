from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from neo4j import GraphDatabase
import os
import json
import re  # 加在文件顶部，方便用正则
import requests

router = APIRouter()

class TextRequest(BaseModel):
    text: str
    prompt: str
    model: str

# Neo4j 连接配置
uri = "bolt://localhost:7687"
user = "neo4j"
password = "610766356Xzy"
driver = GraphDatabase.driver(uri, auth=(user, password))

# 文件上传目录
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "data", "terminology_upload")


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


# =============== Triple Extraction 接口 ================
class TripleRequest(BaseModel):
    filename: str
    prompt: str
    model: str


@router.post("/kg/extract_triples_from_filename")
def extract_triples(req: TripleRequest):
    file_path = os.path.join(UPLOAD_DIR, req.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")

    # 1. 读取文件内容（以 .xlsx 为例）
    import pandas as pd
    try:
        df = pd.read_excel(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"读取文件失败：{str(e)}")

    # 2. 拼接 prompt
    text_column = None
    for col in df.columns:
        if "内容" in col or "text" in col.lower():
            text_column = col
            break
    if not text_column:
        raise HTTPException(status_code=400, detail="未找到包含内容的列")

    text_samples = "\n\n".join(df[text_column].astype(str).tolist()[:3])  # 取前3条样例
    final_prompt = f"""
你是一个专业的信息抽取系统，请根据以下 Prompt 要求从旅游文本中抽取实体和关系（NER + RE）：
抽取结果以 JSON 格式返回，格式为：
[
  {{ "head": "...", "relation": "...", "tail": "..." }},
  ...
]

Prompt 要求：
{req.prompt}

待处理文本示例如下：
{text_samples}
"""

    # 3. 发送请求到 LLM 接口
    payload = {
        "model": "deepseek-r1:7b" if req.model == "DeepSeek" else req.model,
        "messages": [
            {"role": "user", "content": final_prompt}
        ]
    }

    try:
        res = requests.post("http://ollama.warhol.informatik.rwth-aachen.de/api/chat", json=payload)
        res.raise_for_status()
        content = res.json()["message"]["content"]

        triples = json.loads(content)  # 更安全替换 eval
        return {"triples": triples}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ 新增：根据单条文本调用模型提取 triples ============
class TextTripleRequest(BaseModel):
    text: str
    prompt: str
    model: str


@router.post("/kg/extract_triples_from_text")
def extract_triples_from_text(req: TextRequest):
    final_prompt = f"""
你是一个专业的信息抽取系统，请根据以下 Prompt 要求从旅游文本中抽取实体和关系（NER + RE）：
抽取结果以 JSON 格式返回，格式为：
[
  {{ "head": "...", "relation": "...", "tail": "..." }},
  ...
]

Prompt 要求：
{req.prompt}

待处理文本如下：
{req.text}
"""
    payload = {
        "model": req.model,
        "messages": [
            {"role": "user", "content": final_prompt}
        ]
    }

    try:
        # 发送请求
        res = requests.post("http://ollama.warhol.informatik.rwth-aachen.de/api/chat", json=payload)
        res.raise_for_status()

        # 处理模型流式返回内容
        lines = res.text.strip().split("\n")
        content_parts = []
        for line in lines:
            try:
                obj = json.loads(line)
                content = obj.get("message", {}).get("content", "")
                content_parts.append(content)
            except json.JSONDecodeError:
                continue  # 跳过非标准 JSON 行

        full_content = "".join(content_parts).strip()

        # 打印原始返回，方便调试
        print("🌟模型原始返回内容：", full_content)

        # 防止开头有 ```json 包裹
        if full_content.startswith("```json"):
            full_content = full_content.replace("```json", "").replace("```", "").strip()

        # ✅ 关键新增！！只提取 [] 里的数组
        match = re.search(r"\[\s*{.*}\s*\]", full_content, re.DOTALL)
        if match:
            clean_json = match.group()
        else:
            raise HTTPException(status_code=500, detail=f"未找到合法的 JSON 数组，原始内容：{full_content}")

        # 尝试解析
        try:
            triples = json.loads(clean_json)
            if not isinstance(triples, list):
                raise ValueError("解析后不是列表")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"JSON解析失败：{str(e)}；提取内容：{clean_json}")

        return {"triples": triples}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"后端处理异常：{str(e)}")
