"""
Text Classification API Routes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from loguru import logger

from app.services.text_service import text_classification_service

router = APIRouter(prefix="/text", tags=["Text Classification"])


class TextRequest(BaseModel):
    """Request model for text classification"""
    text: str = Field(
        ...,
        description="Text complaint in Hindi, Marathi, or English",
        min_length=5,
        max_length=5000,
        examples=["रस्त्यावर मोठे खड्डे पडलेत"]
    )


class TextResponse(BaseModel):
    """Response model for text classification"""
    success: bool
    prediction: Optional[str] = None
    confidence: Optional[float] = None
    probabilities: Optional[dict] = None
    original_text: Optional[str] = None
    cleaned_text: Optional[str] = None
    error: Optional[str] = None


class BatchTextRequest(BaseModel):
    """Request model for batch text classification"""
    texts: List[str] = Field(
        ...,
        description="List of text complaints",
        max_items=50
    )


@router.post("/classify", response_model=TextResponse)
async def classify_text(request: TextRequest):
    """
    Classify a single text complaint
    
    - Supports Hindi, Marathi, and English
    - Returns predicted category and confidence
    - Categories: potholes, garbage, fallen_trees, electric_poles
    """
    try:
        logger.info(f"Received text classification request")
        
        result = text_classification_service.predict(request.text)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return TextResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Text classification endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/classify-batch")
async def classify_batch(request: BatchTextRequest):
    """
    Classify multiple text complaints at once
    
    - Maximum 50 texts per request
    - Returns list of predictions
    """
    try:
        if len(request.texts) > 50:
            raise HTTPException(
                status_code=400,
                detail="Maximum 50 texts allowed per batch"
            )
        
        logger.info(f"Received batch request with {len(request.texts)} texts")
        
        results = text_classification_service.batch_predict(request.texts)
        
        return {
            "success": True,
            "count": len(results),
            "results": results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))