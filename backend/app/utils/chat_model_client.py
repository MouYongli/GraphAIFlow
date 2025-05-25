from together import Together
import os
import re
import json
from datetime import datetime

def call_chat_api(prompt, system_message="", note_id="frontend_chat", chat_history=None, model_name="deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"):
    """
    使用 Together.ai 的 Chat Completion 接口统一调用模型。
    默认模型为 DeepSeek，支持传入自定义模型名称。
    """
    client = Together(api_key=os.getenv("TOGETHER_API_KEY"))

    if chat_history and isinstance(chat_history, list):
        chat_history = [
            msg.dict() if hasattr(msg, "dict") else dict(msg)
            for msg in chat_history
        ]
    else:
        chat_history = []

    messages = []
    if system_message:
        messages.append({"role": "system", "content": system_message})
    if chat_history:
        messages.extend(chat_history)
    messages.append({"role": "user", "content": prompt})

    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=0.1,
            max_tokens=512,
            seed=42
        )

        reply = response.choices[0].message.content.strip()

        # 清除 <think> 标签等调试内容
        reply = re.sub(r"<think>.*?</think>", "", reply, flags=re.DOTALL).strip()

    except Exception as e:
        print("❌ Together Chat API 调用失败：", str(e))
        reply = f"[Error] Chat API 调用失败：{str(e)}"

    # 保存日志
    os.makedirs("logs/chat", exist_ok=True)
    log_path = os.path.join("logs/chat", f"{note_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
    log_data = {
        "note_id": note_id,
        "model": model_name,
        "prompt": prompt,
        "system_message": system_message,
        "chat_history": chat_history,
        "response": reply,
        "time": datetime.now().isoformat()
    }
    with open(log_path, "w", encoding="utf-8") as f:
        json.dump(log_data, f, ensure_ascii=False, indent=2)

    return reply
