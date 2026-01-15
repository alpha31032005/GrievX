"""
Image Classification Service
Handles image preprocessing and CNN prediction
"""

import numpy as np
from PIL import Image
from loguru import logger
from typing import Dict, Any, Union
from io import BytesIO

from app.models.model_loader import model_loader
from app.utils.preprocessing import ImagePreprocessor
from app.config import settings


class ImageClassificationService:
    """Service for classifying civic issue images"""
    
    def __init__(self):
        """Initialize service"""
        self.image_model = None
        self.preprocessor = ImagePreprocessor()
        self.categories = settings.CATEGORIES
    
    def load_model(self):
        """Load CNN model if not already loaded"""
        if self.image_model is None:
            logger.info("Loading image classification model...")
            self.image_model = model_loader.load_image_classifier()
            logger.success("Image model loaded successfully")
    
    def predict(
        self,
        image: Union[bytes, Image.Image],
        enhance: bool = False
    ) -> Dict[str, Any]:
        """
        Predict category from image
        
        Args:
            image: Image as bytes or PIL Image
            enhance: Whether to apply image enhancement
            
        Returns:
            Dictionary with prediction results
        """
        try:
            # Ensure model is loaded
            self.load_model()
            
            # Check if model loaded successfully
            if self.image_model is None:
                logger.error("Image classification model is unavailable")
                return {
                    "success": False,
                    "error": "Image classification model is currently unavailable. Please try text classification or contact support.",
                    "error_type": "MODEL_UNAVAILABLE"
                }
            
            # Step 1: Convert bytes to PIL Image if necessary
            if isinstance(image, bytes):
                pil_image = Image.open(BytesIO(image))
            else:
                pil_image = image
            
            # Step 2: Validate image
            is_valid, error_msg = self.preprocessor.validate_image(pil_image)
            if not is_valid:
                return {
                    "success": False,
                    "error": error_msg
                }
            
            logger.info(f"Processing image of size: {pil_image.size}")
            
            # Step 3: Preprocess image
            processed_image = self.preprocessor.preprocess_image(pil_image)
            
            # Step 4: Optional enhancement
            if enhance:
                processed_image = self.preprocessor.enhance_image(
                    processed_image[0]  # Remove batch dimension
                )
                processed_image = np.expand_dims(processed_image, axis=0)
            
            # Step 5: Make prediction
            predictions = self.image_model.predict(
                processed_image,
                verbose=0  # Suppress output
            )
            
            # Step 6: Process predictions
            predicted_class_idx = np.argmax(predictions[0])
            predicted_category = self.categories[predicted_class_idx]
            confidence = float(predictions[0][predicted_class_idx])
            
            # Get all class probabilities
            class_probabilities = {
                category: float(prob)
                for category, prob in zip(self.categories, predictions[0])
            }
            
            logger.success(
                f"✓ Predicted category: {predicted_category} "
                f"(confidence: {confidence:.2%})"
            )
            
            return {
                "success": True,
                "prediction": predicted_category,
                "confidence": confidence,
                "probabilities": class_probabilities,
                "image_size": pil_image.size,
                "enhanced": enhance
            }
            
        except Exception as e:
            logger.error(f"Image prediction failed: {str(e)}")
            return {
                "success": False,
                "error": f"Prediction error: {str(e)}"
            }
    
    def predict_top_k(
        self,
        image: Union[bytes, Image.Image],
        k: int = 2
    ) -> Dict[str, Any]:
        """
        Get top K predictions with probabilities
        
        Args:
            image: Image as bytes or PIL Image
            k: Number of top predictions to return
            
        Returns:
            Dictionary with top K predictions
        """
        result = self.predict(image)
        
        if not result["success"]:
            return result
        
        # Sort probabilities
        probabilities = result["probabilities"]
        top_k_predictions = sorted(
            probabilities.items(),
            key=lambda x: x[1],
            reverse=True
        )[:k]
        
        return {
            "success": True,
            "top_predictions": [
                {
                    "category": category,
                    "confidence": confidence
                }
                for category, confidence in top_k_predictions
            ],
            "all_probabilities": probabilities
        }


# Global service instance
image_classification_service = ImageClassificationService()