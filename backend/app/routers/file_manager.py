# backend/app/routers/file_manager.py
import os
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from starlette.status import HTTP_201_CREATED

from app.utils.parser import parse_rdf_owl  # 自定义解析函数

router = APIRouter()

# 文件存储目录（data 目录位于 backend 根目录下）
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
FILE_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(FILE_DIR, exist_ok=True)

def get_file_path(filename: str) -> str:
    return os.path.join(FILE_DIR, filename)

@router.get("/", response_model=List[str])
async def list_files():
    """
    列出所有 .owl/.rdf/.ttl 文件名
    """
    files = [f for f in os.listdir(FILE_DIR) if f.endswith(('.owl', '.rdf', '.ttl'))]
    return files

@router.post("/", status_code=HTTP_201_CREATED)
async def upload_file(file: UploadFile = File(...)):
    """
    上传 .owl/.rdf/.ttl 文件
    """
    if not file:
        raise HTTPException(status_code=400, detail="没有收到文件")

    print(f" 接收到文件: {file.filename}")  #  确保后端收到了请求

    if not file.filename.endswith(('.owl', '.rdf', '.ttl')):
        raise HTTPException(status_code=400, detail="只允许上传 .owl、.rdf 或 .ttl 文件")

    file_path = get_file_path(file.filename)
    
    try:
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        print(f" 上传成功: {file.filename}")  #  确保写入成功
    except Exception as e:
        print(f" 写入文件失败: {e}")  #  发现写入错误
        raise HTTPException(status_code=500, detail=f"写入文件失败: {str(e)}")

    return {"filename": file.filename, "message": "上传成功"}

@router.get("/{filename}")
async def get_file(filename: str):
    """
    获取指定文件的文本内容，用于编辑
    """
    file_path = get_file_path(filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    return FileResponse(file_path, media_type="text/plain", filename=filename)

@router.put("/{filename}")
async def update_file(filename: str, content: str = None):
    """
    更新指定文件的内容
    """
    file_path = get_file_path(filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content or "")
    return {"message": "更新成功", "filename": filename}

@router.delete("/{filename}")
async def delete_file(filename: str):
    """
    删除指定文件
    """
    file_path = get_file_path(filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    os.remove(file_path)
    return {"message": "删除成功", "filename": filename}

@router.get("/{filename}/parse")
async def parse_file(filename: str):
    """
    解析 TTL/OWL 文件，返回节点和边数据
    """
    file_path = get_file_path(filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    try:
        graph_data = parse_rdf_owl(file_path)  # 📌 调用解析函数
        return {
            "filename": filename,
            "graph": graph_data  # 直接返回解析的数据
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"解析文件失败: {str(e)}")
