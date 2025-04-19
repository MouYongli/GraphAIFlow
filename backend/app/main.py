from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import file_manager, ontology, terminology_upload, processing_upload
from app.routers import chat_api
from app.routers import recommendation_api
from app.routers import kg_api  # ← 导入新模块



app = FastAPI(
    title="Owl/RDF/TTL Manager",
    description="通过 FastAPI 提供文件上传、查询、删除以及解析等功能。",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#uvicorn app.main:app --reload
# 运行项目
app.include_router(recommendation_api.router)
app.include_router(file_manager.router, prefix="/api/files", tags=["files"])
app.include_router(ontology.router, prefix="/api/ontology", tags=["ontology"])
app.include_router(terminology_upload.router, prefix="/api/terminology")
app.include_router(chat_api.router, prefix="/api")
app.include_router(processing_upload.router, prefix="/api")  
app.include_router(kg_api.router, prefix="/api")  
