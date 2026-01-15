"""
Configuration file for ML Service
Handles environment variables and model paths
"""

from pathlib import Path
from typing import List
import os

# For Pydantic v2 (if you have v1, change this)
try:
    from pydantic_settings import BaseSettings
    from pydantic import Field
except ImportError:
    # Fallback for Pydantic v1
    from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # API Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_RELOAD: bool = True
    
    # Model Paths - Using absolute paths for Windows compatibility
    BASE_DIR: Path = Path(__file__).resolve().parent
    MODELS_DIR: Path = BASE_DIR / "models"
    TEXT_MODEL_PATH: Path = MODELS_DIR / "text_classifier.pkl"
    IMAGE_MODEL_PATH: Path = MODELS_DIR / "image_classifier.h5"
    
    # Model Configuration
    IMAGE_SIZE: tuple = (224, 224)
    MAX_TEXT_LENGTH: int = 512
    
    # Categories
    CATEGORIES: List[str] = ["potholes", "garbage", "fallen_trees", "electric_poles"]
    
    # mBERT Model for multilingual support
    MBERT_MODEL: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    
    # CORS Settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
    ]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        # Allow arbitrary types for Path objects
        arbitrary_types_allowed = True


# Create settings instance
try:
    settings = Settings()
    
    # Create models directory if it doesn't exist
    settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
    
except Exception as e:
    print(f"Error loading settings: {e}")
    raise