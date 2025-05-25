from fastapi import APIRouter, UploadFile, File
import os
from fastapi import Body
from app.utils.parser import (
    parse_rdf_owl,
    add_class_to_graph,
    add_object_property_to_graph,
    add_data_property_to_graph,
    remove_class_from_graph,
    remove_object_property_from_graph,
    remove_data_property_from_graph
)
from fastapi.responses import FileResponse
from fastapi import Query

router = APIRouter()

UPLOAD_DIR = "./data"



@router.post("/parse")
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




@router.post("/add_class")
async def add_class(
    filename: str = Body(...),
    class_name: str = Body(...),
    parent_class: str = Body(None)
):
    print(f"📥 正在添加类: {class_name}, 父类: {parent_class}, 文件: {filename}")
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        print("❌ 文件不存在")
        return {"error": "文件不存在"}
    
    success = add_class_to_graph(file_path, class_name, parent_class)
    
    if success:
        print("✅ 添加类成功")
        return {"message": "添加类成功"}
    else:
        print("❌ 添加类失败")
        return {"error": "添加类失败"}

@router.post("/add_object_property")
async def add_object_property(
    filename: str = Body(...),
    prop_name: str = Body(...),
    domain: str = Body(...),
    range_: str = Body(...)
):
    file_path = os.path.join(UPLOAD_DIR, filename)
    success = add_object_property_to_graph(file_path, prop_name, domain, range_)
    if success:
        return {"message": "添加对象属性成功"}
    else:
        return {"error": "添加对象属性失败"}

@router.post("/add_data_property")
async def add_data_property(
    filename: str = Body(...),
    prop_name: str = Body(...),
    domain: str = Body(...),
    range_: str = Body(...),
):
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # 确保数据属性正确添加到图谱中
    success = add_data_property_to_graph(file_path, prop_name, domain, range_)

    if success:
        return {"message": "添加数据属性成功"}
    else:
        return {"error": "添加数据属性失败"}



@router.get("/export")
async def export_ontology(filename: str = Query(...)):
    file_path = f"./data/{filename}"
    if not os.path.exists(file_path):
        return {"error": "文件不存在"}

    # 自动根据后缀设置 media_type
    if filename.endswith(".ttl"):
        media_type = "text/turtle"
    elif filename.endswith(".rdf") or filename.endswith(".owl"):
        media_type = "application/rdf+xml"
    else:
        media_type = "application/octet-stream"

    return FileResponse(path=file_path, filename=filename, media_type=media_type)


# ✅ 新增：删除类
@router.post("/delete_class")
async def delete_class(
    filename: str = Body(...),
    class_name: str = Body(...)
):
    file_path = os.path.join(UPLOAD_DIR, filename)
    success = remove_class_from_graph(file_path, class_name)
    return {"message": "删除类成功"} if success else {"error": "删除类失败"}


# ✅ 新增：删除对象属性
@router.post("/delete_object_property")
async def delete_object_property(
    filename: str = Body(...),
    prop_name: str = Body(...)
):
    file_path = os.path.join(UPLOAD_DIR, filename)
    success = remove_object_property_from_graph(file_path, prop_name)
    return {"message": "删除对象属性成功"} if success else {"error": "删除对象属性失败"}


# ✅ 新增：删除数据属性
@router.post("/delete_data_property")
async def delete_data_property(
    filename: str = Body(...),
    prop_name: str = Body(...)
):
    file_path = os.path.join(UPLOAD_DIR, filename)
    success = remove_data_property_from_graph(file_path, prop_name)
    return {"message": "删除数据属性成功"} if success else {"error": "删除数据属性失败"}
