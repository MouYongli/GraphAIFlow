import os
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from starlette.status import HTTP_201_CREATED

from app.utils.parser import parse_rdf_owl  # 导入 RDF/OWL 解析函数

router = APIRouter()

# 设置文件存储目录（data 目录位于 backend 根目录下）
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
FILE_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(FILE_DIR, exist_ok=True)

def get_file_path(filename: str) -> str:
    return os.path.join(FILE_DIR, filename)

@router.get("/", response_model=List[str])
async def list_files():
    """列出所有 .owl/.rdf/.ttl 文件"""
    files = [f for f in os.listdir(FILE_DIR) if f.endswith(('.owl', '.rdf', '.ttl'))]
    return files

@router.post("/", status_code=HTTP_201_CREATED)
async def upload_file(file: UploadFile = File(...)):
    """上传 .owl/.rdf/.ttl 文件"""
    if not file.filename.endswith(('.owl', '.rdf', '.ttl')):
        raise HTTPException(status_code=400, detail="只允许上传 .owl、.rdf 或 .ttl 文件")

    file_path = get_file_path(file.filename)
    
    try:
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"写入文件失败: {str(e)}")

    return {"filename": file.filename, "message": "上传成功"}

@router.get("/{filename}")
async def get_file(filename: str):
    """获取指定文件内容"""
    file_path = get_file_path(filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    return FileResponse(file_path, media_type="text/plain", filename=filename)

@router.delete("/{filename}")
async def delete_file(filename: str):
    """删除指定文件"""
    file_path = get_file_path(filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    os.remove(file_path)
    return {"message": "删除成功", "filename": filename}

@router.get("/{filename}/parse")
async def parse_file(filename: str):
    """解析 TTL/OWL 文件"""
    file_path = get_file_path(filename)
    print(f"收到解析请求，文件路径: {file_path}")  # ✅ 这里打印路径
    if not os.path.exists(file_path):
        print("❌ 文件不存在")
        raise HTTPException(status_code=404, detail="文件不存在")

    try:
        graph_data = parse_rdf_owl(file_path)
        print(f"✅ 解析成功，返回数据: {graph_data}")  # ✅ 这里打印解析结果
        return {"filename": filename, "graph": graph_data}
    except Exception as e:
        print(f"❌ 解析失败: {e}")  # ✅ 这里打印错误
        raise HTTPException(status_code=500, detail=f"解析文件失败: {str(e)}")
