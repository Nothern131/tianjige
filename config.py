"""
天机阁 · 配置管理模块
统一管理所有环境变量和配置项，支持 .env 文件覆盖
"""
import os
from pathlib import Path
from typing import Optional

# 项目根目录
PROJECT_ROOT = Path(__file__).parent

# 尝试加载 .env 文件
try:
    from dotenv import load_dotenv
    env_path = PROJECT_ROOT / ".env"
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass  # python-dotenv 可选


class Config:
    """应用配置"""

    # ---- 项目根目录 ----
    PROJECT_ROOT: Path = PROJECT_ROOT

    # ---- 服务器 ----
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8889"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    RELOAD: bool = os.getenv("RELOAD", "false").lower() == "true"

    # ---- 路径 ----
    STATIC_DIR: Path = PROJECT_ROOT / "static"
    KB_DIR: Path = PROJECT_ROOT / "kb"
    DOCS_DIR: Path = PROJECT_ROOT / "docs"
    RULES_DIR: Path = PROJECT_ROOT / "rules"

    # ---- CORS ----
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "*").split(",")

    # ---- 日志 ----
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: Optional[str] = os.getenv("LOG_FILE", None)

    # ---- 数据库（可选） ----
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL", None)

    @classmethod
    def as_dict(cls) -> dict:
        """返回所有非私有配置项的字典"""
        return {
            k: v for k, v in cls.__dict__.items()
            if not k.startswith("_") and not callable(v)
        }


# 单例
config = Config()