"""
Image Classification API Routes
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from pydantic import BaseModel
from typing import Optional
from loguru import logger
from PIL import Image
import io

from app.services.image_service import image_classification_service

router = APIRouter(prefix="/image", tags=["Image Classification"])


class ImageResponse(BaseModel):
    """Response model for image classification"""
    success: bool
    prediction: Optional[str] = None
    confidence: Optional[float] = None
    probabilities: Optional[dict] = None
    image_size: Optional[tuple] = None
    enhanced: Optional[bool] = None
    error: Optional[str] = None


@router.post("/classify", response_model=ImageResponse)
async def classify_image(
    file: UploadFile = File(..., description="Image file (JPG, PNG, JPEG)"),
    enhance: bool = Form(False, description="Apply image enhancement")
):
    """
    Classify a civic issue from an image
    
    - Accepts JPG, PNG, JPEG formats
    - Image size: minimum 50x50 pixels, maximum 10MB
    - Returns predicted category and confidence
    - Categories: potholes, garbage, fallen_trees, electric_poles
    """
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
            )
        
        logger.info(f"Received image: {file.filename} ({file.content_type})")
        
        # Read image bytes
        image_bytes = await file.read()
        
        # Validate file size (10MB limit)
        if len(image_bytes) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="Image too large. Maximum size: 10MB"
            )
        
        # Make prediction
        result = image_classification_service.predict(
            image=image_bytes,
            enhance=enhance
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return ImageResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image classification endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/classify-top-k")
async def classify_image_top_k(
    file: UploadFile = File(...),
    k: int = Form(2, ge=1, le=4, description="Number of top predictions")
):
    """
    Get top K predictions for an image
    
    - Returns multiple predictions with probabilities
    - Useful when confidence is low
    """
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
            )
        
        logger.info(f"Received top-{k} request for: {file.filename}")
        
        # Read image
        image_bytes = await file.read()
        
        # Make prediction
        result = image_classification_service.predict_top_k(
            image=image_bytes,
            k=k
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Top-K classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))