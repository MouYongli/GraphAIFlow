from fastapi import APIRouter
from typing import List, Optional
from pydantic import BaseModel
import os
import json
# 假设你已经有 survey 数据保存在数据库或内存中，这里用模拟数据替代
# 实际可从数据库中 query 出所有记录

router = APIRouter()

class SurveyRecord(BaseModel):
    chat_id: str
    sus_score: float
    detail_scores: Optional[List[int]] = []
    suggestion: Optional[str] = ""


@router.get("/api/chat/survey_detail_list", response_model=List[SurveyRecord])
def get_all_survey_details_from_files():
    folder = "logs/chat_survey"
    if not os.path.exists(folder):
        return []

    results = []
    for fname in os.listdir(folder):
        if fname.endswith("_sus.json"):
            try:
                with open(os.path.join(folder, fname), "r", encoding="utf-8") as f:
                    data = json.load(f)
                    results.append(SurveyRecord(**data))  # 用模型保证字段完整性
            except Exception as e:
                print(f"[读取失败] {fname} - {e}")
                continue
    return results

