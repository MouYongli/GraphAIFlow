# backend/app/routers/test-together-llama33.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from together import Together
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class TestRequest(BaseModel):
    model: str
    prompt: str
    # backend/app/routers/test_together_llama33.py

async def call_llm(prompt: str, model: str = "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free") -> str:
    client = Together(api_key=os.getenv("TOGETHER_API_KEY"))

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "你是一个结构化信息抽取助手"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,
        max_tokens=512,
        seed=42
    )

    return response.choices[0].message.content


@router.post("/api/test_together")
def test_together_model(request: TestRequest):
    try:
        client = Together(api_key=os.getenv("TOGETHER_API_KEY"))

        response = client.chat.completions.create(
            model=request.model,
            messages=[
                {"role": "system", "content": "你是一个结构化信息抽取助手"},
                {"role": "user", "content": request.prompt}
            ],
            temperature=0.1,
            max_tokens=512,
            seed=42
        )

        return {
            "model": request.model,
            "response": response.choices[0].message.content
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/test_deepseek")
def test_deepseek_model(request: TestRequest):
    try:
        client = Together(api_key=os.getenv("TOGETHER_API_KEY"))

        response = client.chat.completions.create(
            model=request.model,
            messages=[
                {"role": "system", "content": "你是一个结构化信息抽取助手"},
                {"role": "user", "content": request.prompt}
            ],
            temperature=0.1,
            max_tokens=512,
            seed=42
        )

        return {
            "model": request.model,
            "response": response.choices[0].message.content
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/models")
def get_model_list():
    return [
        {
            "displayName": "Together-LLaMA 3.3 70B Instruct Turbo",
            "modelName": "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
            "endpoint": "http://localhost:8000/api/test_together"
        },
        {
            "displayName": "DeepSeek 70B Distill",
            "modelName": "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
            "endpoint": "http://localhost:8000/api/test_deepseek"
        }
    ]
