from typing import List, Optional
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
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

def load_ratings():
    rating_file = "logs/chat/rating_log.jsonl"
    if not os.path.exists(rating_file):
        return []

    ratings = []
    with open(rating_file, "r", encoding="utf-8") as f:
        for line in f:
            try:
                ratings.append(json.loads(line.strip()))
            except:
                continue
    return ratings


@router.post("/chat")
def chat_with_ai(request: ChatRequest):
    reply = call_chat_api(
        prompt=request.content,
        system_message="你是一个专业的中文旅游助手，欢迎提问。请根据用户问题进行精确简洁的回答，不要重复、不扩展、不输出无关内容。",
        note_id="frontend_chat",
        chat_history=request.chat_history
    )

    # 🆕 加入保存逻辑
    from datetime import datetime
    import uuid

    # 获取 chat_id，如果前端没传，就自动生成
    chat_id = None
    if request.chat_history and len(request.chat_history) > 0:
        # 复用第一条记录的 ID 或内容哈希（你也可以从前端传 chat_id 过来）
        chat_id = request.chat_history[0].content[:30].replace(" ", "_")  # 简单 fallback
    else:
        chat_id = f"frontend_chat_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:4]}"

    messages = request.chat_history or []
    messages.append({"role": "user", "content": request.content})
    messages.append({"role": "bot", "content": reply})

    os.makedirs("logs/chat", exist_ok=True)
    with open(f"logs/chat/{chat_id}.json", "w", encoding="utf-8") as f:
        json.dump(messages, f, ensure_ascii=False, indent=2)

    return {"reply": reply, "chat_id": chat_id}


@router.post("/chat/clear")
def clear_chat_history():
    log_dir = "logs/chat"
    if os.path.exists(log_dir):
        for f in os.listdir(log_dir):
            if f.startswith("frontend_chat_"):
                os.remove(os.path.join(log_dir, f))
    return {"status": "cleared"}

#  新增接口：术语推荐用 DeepSeek 生成建议
@router.post("/deepseek/ontology_suggestion")
async def suggest_ontology_update(request: Request):
    body = await request.json()
    terms = body.get("terms", [])
    ontology_text = body.get("ontology", "")
    model_name = body.get("model_name", "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free")

    if not terms or not ontology_text:
        return {"error": "术语列表或本体结构缺失"}

    prompt = build_prompt_for_terminology_suggestion(terms, ontology_text)

    try:
        result_text = call_chat_api(prompt, note_id="terminology_suggestion", model_name=model_name)
        suggestions = json.loads(result_text)
    except json.JSONDecodeError:
        suggestions = [{
            "term": "解析失败",
            "type": "Error",
            "suggested_class": "",
            "reasoning": result_text
        }]
    except Exception as e:
        return {
            "result": [{
                "term": "模型调用失败",
                "type": "Error",
                "suggested_class": "",
                "reasoning": f"[Error] Chat API 调用失败：{str(e)}"
            }]
        }

    return {"result": suggestions}

#  新增接口：获取聊天历史记录文件名
@router.get("/chat/history")
def get_chat_history():
    log_dir = "logs/chat"
    if not os.path.exists(log_dir):
        return []
    files = os.listdir(log_dir)
    chat_ids = [
        f.replace(".json", "") for f in files
        if f.startswith("frontend_chat_") and f.endswith(".json")
    ]
    return JSONResponse(content=chat_ids)

#  新增接口：删除指定聊天记录文件
@router.delete("/chat/delete/{chat_id}")
def delete_chat_file(chat_id: str):
    log_dir = "logs/chat"
    file_path = os.path.join(log_dir, f"{chat_id}.json")
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": "deleted"}
    else:
        raise HTTPException(status_code=404, detail="File not found")


@router.get("/chat/load/{chat_id}")
def load_chat_file(chat_id: str):
    log_dir = "logs/chat"
    file_path = os.path.join(log_dir, f"{chat_id}.json")
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    else:
        raise HTTPException(status_code=404, detail="Chat record not found")

@router.get("/chat/summary")
async def get_chat_summary():
    ratings = load_ratings()
    
    chat_summary = {}
    for r in ratings:
        cid = r["chat_id"]
        if cid not in chat_summary:
            chat_summary[cid] = {"count": 0, "sum": 0}
        chat_summary[cid]["count"] += 1
        chat_summary[cid]["sum"] += r["score"]
    
    result = []
    for cid, info in chat_summary.items():
        avg = round(info["sum"] / info["count"], 2)
        result.append({
            "chat_id": cid,
            "score_count": info["count"],
            "average_score": avg
        })

    return result


@router.post("/chat/survey_result")
def save_sus_result(data: dict):
    chat_id = data.get("chat_id")
    detail_scores = data.get("detail_scores", [])
    suggestion = data.get("suggestion", "")  #  接收 suggestion 字段

    if not chat_id or not detail_scores:
        raise HTTPException(status_code=400, detail="缺少 chat_id 或 detail_scores")

    #  计算平均分（仍基于前10题）
    avg_score = round(sum(detail_scores[:10]) / 10, 2)

    folder = "logs/chat_survey"
    os.makedirs(folder, exist_ok=True)
    with open(os.path.join(folder, f"{chat_id}_sus.json"), "w", encoding="utf-8") as f:
        json.dump({
            "chat_id": chat_id,
            "sus_score": avg_score,
            "detail_scores": detail_scores,
            "suggestion": suggestion   #  保存建议内容
        }, f, ensure_ascii=False)

    return {"message": "问卷已保存"}




@router.get("/chat/survey_list")
def get_survey_list():
    folder = "logs/chat_survey"
    if not os.path.exists(folder):
        return []
    
    records = []
    for fname in os.listdir(folder):
        if fname.endswith("_sus.json"):
            try:
                with open(os.path.join(folder, fname), "r", encoding="utf-8") as f:
                    data = json.load(f)
                    records.append(data)
            except:
                continue
    return records


@router.get("/chat/survey/{chat_id}")
def get_survey_result(chat_id: str):
    folder = "logs/chat_survey"
    file_path = os.path.join(folder, f"{chat_id}_sus.json")
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    else:
        raise HTTPException(status_code=404, detail="问卷记录未找到")

@router.post("/chat/save_log")
def save_chat_log(data: dict):
    chat_id = data.get("chat_id")
    messages = data.get("messages")

    if not chat_id or not messages:
        raise HTTPException(status_code=400, detail="缺少 chat_id 或 messages")

    folder = "logs/chat"
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, f"{chat_id}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(messages, f, ensure_ascii=False, indent=2)

    return {"message": "保存成功"}

@router.post("/chat/rate")
def save_rating(data: dict):
    chat_id = data.get("chat_id")
    message_id = data.get("message_id")
    score = data.get("score")

    if not chat_id or message_id is None or score is None:
        raise HTTPException(status_code=400, detail="缺少 chat_id、message_id 或 score")

    folder = "logs/chat"
    os.makedirs(folder, exist_ok=True)
    file_path = os.path.join(folder, "rating_log.jsonl")
    with open(file_path, "a", encoding="utf-8") as f:
        f.write(json.dumps({
            "chat_id": chat_id,
            "message_id": message_id,
            "score": score
        }, ensure_ascii=False) + "\n")

    return {"message": "评分已保存"}

@router.delete("/chat/survey/{chat_id}")
def delete_survey_record(chat_id: str):
    folder = "logs/chat_survey"
    file_path = os.path.join(folder, f"{chat_id}_sus.json")

    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": f"SUS survey for {chat_id} deleted."}
    else:
        raise HTTPException(status_code=404, detail="Survey record not found")

@router.delete("/chat/rating_delete/{chat_id}")
def delete_rating_record(chat_id: str):
    file_path = os.path.join("logs/chat", "rating_log.jsonl")
    if not os.path.exists(file_path):
        return {"message": "rating log not found"}

    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    filtered = [line for line in lines if f'"chat_id": "{chat_id}"' not in line]
    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(filtered)

    return {"message": f"Ratings for {chat_id} deleted."}


@router.get("/chat/ratings/{chat_id}")
def get_chat_ratings(chat_id: str):
    ratings = load_ratings()
    matched = [r for r in ratings if r["chat_id"] == chat_id]
    return matched


