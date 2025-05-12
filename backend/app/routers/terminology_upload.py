from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from app.utils import terminology_extractor
import os
from fastapi import Query
import pandas as pd


router = APIRouter()

# 路径为 backend/data/terminology_upload
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "data", "terminology_upload")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# backend/app/routers/terminology_upload.py

@router.post("/upload")
async def upload_terminology_file(
    file: UploadFile = File(...),
    save: bool = Form(False)
):
    if not file.filename.endswith(('.xlsx', '.csv')):  # ✅ 删除 .json 支持
        raise HTTPException(status_code=400, detail="仅支持 .xlsx 和 .csv 文件")

    content = await file.read()
    if save:
        save_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(save_path, "wb") as f:
            f.write(content)

    return {"filename": file.filename, "message": "上传成功"}

@router.delete("/delete")
def delete_terminology_file(filename: str = Query(...)):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")

    try:
        os.remove(file_path)
        return {"message": f"{filename} 已删除"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
def list_terminology_files():
    files = [f for f in os.listdir(UPLOAD_DIR) if f.endswith(('.xlsx', '.csv', '.json'))]
    return {"files": files}

@router.get("/columns")
def get_columns(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    try:
        cols = terminology_extractor.extract_columns(file_path)
        return {"columns": cols}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/extract")
def extract_terms_route(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)  # ✅ 改为上传目录
    try:
        terms = terminology_extractor.extract_terms(file_path)
        return {"candidates": terms}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/extract_texts")
def extract_texts(filename: str = Query(...)):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")

    try:
        df = pd.read_excel(file_path)
        # 自动检测包含内容的列
        text_col = None
        for col in df.columns:
            if "内容" in col or "text" in col.lower():
                text_col = col
                break
        if not text_col:
            raise HTTPException(status_code=400, detail="未找到包含内容的列")

        texts = df[text_col].astype(str).tolist()
        return {"texts": texts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

