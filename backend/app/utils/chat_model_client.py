import requests
import json
import os
import re
from datetime import datetime

def call_chat_api(prompt, system_message="", note_id="frontend_chat", chat_history=None):
    """
    调用 DeepSeek 模型 API，处理多段 JSON 响应，返回最终回复文本。
    支持 chat_history 参数，用于上下文多轮对话。
    自动清除 <think> 标签内容。
    """
    # api_url = "http://ollama.warhol.informatik.rwth-aachen.de/api/chat"
    # model = "deepseek-r1:1.5b"
    # chat_model_client.py 或 config.py 中
    api_url = "http://ollama.corinth.informatik.rwth-aachen.de/api/chat"
    model = "nezahatkorkmaz/deepseek-v3:latest"
    max_tokens = 512
    temperature = 0.1

    # ✅ 统一转换 chat_history 为可处理格式
    if chat_history and isinstance(chat_history, list):
        chat_history = [
            msg.dict() if hasattr(msg, "dict") else dict(msg)
            for msg in chat_history
        ]

    # ✅ 构造上下文 messages
    messages = []
    if system_message:
        messages.append({"role": "system", "content": system_message})
    if chat_history:
        messages.extend(chat_history)
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature
    }

    try:
        response = requests.post(api_url, json=payload, timeout=30)
        response.raise_for_status()

        # 🔧 模型返回是多段 JSON，每段是一条消息
        full_text = response.text
        print("📦 模型原始返回文本：\n", full_text)

        reply_chunks = []
        for line in full_text.strip().split("\n"):
            try:
                obj = json.loads(line)
                content = obj.get("message", {}).get("content", "")
                reply_chunks.append(content)
            except json.JSONDecodeError:
                continue

        # ✅ 拼接内容
        reply = "".join(reply_chunks).strip()

        # ✅ 多轮清除 <think> 标签（彻底清理）
        reply = re.sub(r"<think>.*?</think>", "", reply, flags=re.DOTALL)
        while "<think>" in reply:
            reply = re.sub(r"<think>.*?</think>", "", reply, flags=re.DOTALL)
        reply = reply.strip()

        if not reply:
            reply = "[Error] 模型未返回有效内容"

    except Exception as e:
        print("❌ Chat API 调用异常：", str(e))
        reply = f"[Error] Chat API 调用失败：{str(e)}"

    # ✅ 日志记录
    log_dir = "logs/chat"
    os.makedirs(log_dir, exist_ok=True)

    log_data = {
        "note_id": note_id,
        "prompt": prompt,
        "system_message": system_message,
        "chat_history": chat_history,
        "response": reply,
        "time": datetime.now().isoformat()
    }

    log_path = os.path.join(log_dir, f"{note_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
    with open(log_path, "w", encoding="utf-8") as f:
        json.dump(log_data, f, ensure_ascii=False, indent=2)

    return reply


