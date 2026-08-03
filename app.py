"""
天机阁 · 传统知识推理系统 — FastAPI 入口
"""
import sys
import logging
from pathlib import Path

# 确保项目根目录在 Python 路径中
sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from config import config
from api.bazi_api import router as bazi_router

# 日志配置
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="天机阁 · 传统知识推理系统",
    description="八字排盘 · 紫微斗数 · 奇门遁甲 · 六爻纳甲 · 梅花易数 · 太乙神数 · 风水格局 · 诸葛神数 · 周公解梦 · 大六壬 · 大师蒸馏 · 多术合参",
    version="2.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 路由
app.include_router(bazi_router, prefix="/api/bazi")

# 静态文件
app.mount("/static", StaticFiles(directory=str(config.STATIC_DIR)), name="static")

# 根路由 → index.html
@app.get("/")
async def root():
    return FileResponse(str(config.PROJECT_ROOT / "index.html"))

# 架构页
@app.get("/architecture.html")
async def architecture():
    return FileResponse(str(config.PROJECT_ROOT / "architecture.html"))

# 启动入口
if __name__ == "__main__":
    import uvicorn
    logger.info(f"启动天机阁服务: http://{config.HOST}:{config.PORT}")
    uvicorn.run("app:app", host=config.HOST, port=config.PORT, reload=config.RELOAD)