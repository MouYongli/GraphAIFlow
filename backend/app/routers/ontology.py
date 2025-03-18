from fastapi import APIRouter, UploadFile, File
import os
from app.utils.parser import parse_rdf_owl  # ✅ 修正路径


router = APIRouter()

UPLOAD_DIR = "./data"

@router.post("/api/ontology/parse")
async def parse_ontology(file: UploadFile = File(...)):
    """API 端点：解析 RDF/OWL/TTL 文件"""
    
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    result = parse_rdf_owl(file_path)

    if result is None:
        return {"error": "解析失败"}

    return result
