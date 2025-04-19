from typing import List, Optional
from fastapi import APIRouter, Request
from pydantic import BaseModel
from app.utils.chat_model_client import call_chat_api
from app.utils.chat_model_utils import build_prompt_for_terminology_suggestion
import os
import json

router = APIRouter()


# 原有接口：聊天 + 清空日志（保留不动）
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    content: str
    chat_history: Optional[List[Message]] = None

@router.post("/chat")
def chat_with_ai(request: ChatRequest):
    reply = call_chat_api(
        prompt=request.content,
        system_message="你是一个专业的中文旅游助手，欢迎提问。请根据用户问题进行精确简洁的回答，不要重复、不扩展、不输出无关内容。",
        note_id="frontend_chat",
        chat_history=request.chat_history
    )
    return {"reply": reply}

@router.post("/chat/clear")
def clear_chat_history():
    log_dir = "logs/chat"
    if os.path.exists(log_dir):
        for f in os.listdir(log_dir):
            if f.startswith("frontend_chat_"):
                os.remove(os.path.join(log_dir, f))
    return {"status": "cleared"}

# ✅ 新增接口：术语推荐用 DeepSeek 生成建议
@router.post("/deepseek/ontology_suggestion")
async def suggest_ontology_update(request: Request):
    body = await request.json()
    terms = body.get("terms", [])
    ontology_text = body.get("ontology", "")

    if not terms or not ontology_text:
        return {"error": "术语列表或本体结构缺失"}

    prompt = build_prompt_for_terminology_suggestion(terms, ontology_text)

    try:
        result_text = call_chat_api(prompt, note_id="terminology_suggestion")
        suggestions = json.loads(result_text)
    except json.JSONDecodeError:
        suggestions = [{
            "term": "解析失败",
            "type": "Error",
            "suggested_class": "",
            "reasoning": result_text
        }]
    except Exception as e:
        # ✅ 捕获模型接口异常，并返回详细提示
        return {
            "result": [{
                "term": "模型调用失败",
                "type": "Error",
                "suggested_class": "",
                "reasoning": f"[Error] Chat API 调用失败：{str(e)}"
            }]
        }

    return {"result": suggestions}
