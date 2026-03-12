"""
FastAPI ML Microservice
Main application entry point
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
import sys

from app.config import settings
from app.routes import text_routes, image_routes
from app.models.model_loader import model_loader

# Configure logging
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
    level=settings.LOG_LEVEL
)

# Initialize FastAPI app
app = FastAPI(
    title="Smart Civic ML Service",
    description="Machine Learning microservice for civic issue classification",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
allowed_origins = settings.ALLOWED_ORIGINS[:]
if settings.EXTRA_CORS_ORIGINS:
    allowed_origins.extend([o.strip() for o in settings.EXTRA_CORS_ORIGINS.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """
    Load ML models on startup
    This ensures models are ready before handling requests
    """
    logger.info("=" * 60)
    logger.info("🚀 Starting Smart Civic ML Service")
    logger.info("=" * 60)
    
    models_status = {
        "text_classifier": False,
        "label_encoder": False,
        "embedder": False,
        "image_classifier": False
    }
    
    errors = []
    
    try:
        logger.info("📦 Loading ML models...")
        
        # Load Text Classifier
        try:
            model_loader.load_text_classifier()
            models_status["text_classifier"] = True
            logger.success("✓ Text classifier loaded")
        except Exception as e:
            error_msg = f"Text classifier failed: {str(e)}"
            logger.error(f"✗ {error_msg}")
            errors.append(error_msg)
        
        # Load Label Encoder (optional)
        try:
            encoder = model_loader.load_label_encoder()
            if encoder is not None:
                models_status["label_encoder"] = True
                logger.success("✓ Label encoder loaded")
            else:
                logger.info("ℹ Label encoder not found (will use default labels)")
        except Exception as e:
            logger.warning(f"⚠ Label encoder: {str(e)}")
        
        # Load Embedder
        try:
            model_loader.load_embedder()
            models_status["embedder"] = True
            logger.success("✓ Embedder loaded")
        except Exception as e:
            error_msg = f"Embedder failed: {str(e)}"
            logger.error(f"✗ {error_msg}")
            errors.append(error_msg)
        
        # Load Image Classifier
        try:
            model_loader.load_image_classifier()
            models_status["image_classifier"] = True
            logger.success("✓ Image classifier loaded")
        except Exception as e:
            error_msg = f"Image classifier failed: {str(e)}"
            logger.warning(f"⚠ {error_msg}")
            logger.warning("Image classification endpoints will be unavailable")
            errors.append(error_msg)
        
        logger.info("=" * 60)
        logger.info("📊 Models Status:")
        logger.info(f"   {'✓' if models_status['text_classifier'] else '✗'} Text Classifier")
        logger.info(f"   {'✓' if models_status['label_encoder'] else '✗'} Label Encoder")
        logger.info(f"   {'✓' if models_status['embedder'] else '✗'} Embedder")
        logger.info(f"   {'✓' if models_status['image_classifier'] else '✗'} Image Classifier")
        
        logger.info(f"\n📊 Categories: {settings.CATEGORIES}")
        logger.info(f"🌐 Server: http://{settings.API_HOST}:{settings.API_PORT}")
        logger.info(f"📖 API Docs: http://localhost:8000/docs")
        logger.info("=" * 60)
        
        # Check if at least text classification is working
        text_working = models_status["text_classifier"] and models_status["embedder"]
        image_working = models_status["image_classifier"]
        
        if not text_working and not image_working:
            logger.error("❌ CRITICAL: No models loaded successfully!")
            logger.error("The service is running but predictions will fail")
            logger.error("\nErrors encountered:")
            for error in errors:
                logger.error(f"  - {error}")
        elif text_working and not image_working:
            logger.success("✅ Text classification READY")
            logger.warning("⚠ Image classification UNAVAILABLE")
        elif image_working and not text_working:
            logger.success("✅ Image classification READY")
            logger.warning("⚠ Text classification UNAVAILABLE")
        else:
            logger.success("✅ ALL SYSTEMS READY - Both text and image classification working!")
        
    except Exception as e:
        logger.error(f"❌ Critical startup error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down ML Service")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Smart Civic ML Service",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "text_classification": "/ml/text/classify",
            "image_classification": "/ml/image/classify",
            "health": "/health"
        }
    }


@app.get("/health")
async def health_check():
    """
    Detailed health check
    Returns status of all models
    """
    try:
        model_info = model_loader.get_model_info()
        
        return {
            "status": "healthy",
            "models": model_info,
            "api_version": "1.0.0"
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unhealthy")


@app.get("/categories")
async def get_categories():
    """Get list of supported categories"""
    return {
        "categories": settings.CATEGORIES,
        "count": len(settings.CATEGORIES)
    }


# Include routers
app.include_router(text_routes.router, prefix="/ml")
app.include_router(image_routes.router, prefix="/ml")


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Catch all unhandled exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc)
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD,
        log_level=settings.LOG_LEVEL.lower()
    )