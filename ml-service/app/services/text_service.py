"""
Text Classification Service
Handles text preprocessing, embedding generation, and prediction
"""

import numpy as np
from loguru import logger
from typing import Dict, Any

from app.models.model_loader import model_loader
from app.utils.preprocessing import TextPreprocessor
from app.config import settings


class TextClassificationService:
    """Service for classifying civic issue text complaints"""
    
    def __init__(self):
        """Initialize service with models"""
        self.text_model = None
        self.embedder = None
        self.label_encoder = None  # ADD THIS
        self.preprocessor = TextPreprocessor()
        self.categories = settings.CATEGORIES
    
    def load_models(self):
        """Load ML models if not already loaded"""
        if self.text_model is None:
            logger.info("Loading text classification models...")
            self.text_model = model_loader.load_text_classifier()
            self.embedder = model_loader.load_embedder()
            self.label_encoder = model_loader.load_label_encoder()  # ADD THIS
            logger.success("Models loaded successfully")
    
    def generate_embeddings(self, text: str) -> np.ndarray:
        """
        Generate multilingual embeddings using mBERT
        
        Args:
            text: Cleaned text string
            
        Returns:
            Embedding vector (numpy array)
        """
        try:
            # Generate embeddings using sentence-transformers
            embeddings = self.embedder.encode(
                text,
                convert_to_numpy=True,
                show_progress_bar=False
            )
            
            return embeddings
            
        except Exception as e:
            logger.error(f"Embedding generation failed: {str(e)}")
            raise
    
    def predict(self, text: str) -> Dict[str, Any]:
        """
        Predict category from text complaint
        
        Args:
            text: Raw input text (Hindi/Marathi/English)
            
        Returns:
            Dictionary with prediction results
        """
        try:
            # Ensure models are loaded
            self.load_models()
            
            # Step 1: Validate text
            is_valid, error_msg = self.preprocessor.validate_text(text)
            if not is_valid:
                return {
                    "success": False,
                    "error": error_msg
                }
            
            # Step 2: Clean and preprocess text
            cleaned_text = self.preprocessor.clean_text(text)
            cleaned_text = self.preprocessor.truncate_text(cleaned_text)
            
            logger.info(f"Processing text: '{cleaned_text[:50]}...'")
            
            # Step 3: Generate embeddings
            embeddings = self.generate_embeddings(cleaned_text)
            
            # Step 4: Reshape for sklearn model (expects 2D array)
            embeddings_2d = embeddings.reshape(1, -1)
            
            # Step 5: Predict using trained model
            prediction_encoded = self.text_model.predict(embeddings_2d)[0]
            
            # Step 6: Decode prediction if label encoder exists
            if self.label_encoder is not None:
                prediction = self.label_encoder.inverse_transform([prediction_encoded])[0]
            else:
                prediction = prediction_encoded
            
            # Step 7: Get prediction probabilities (if available)
            confidence = None
            class_probabilities = None
            
            if hasattr(self.text_model, 'predict_proba'):
                probabilities = self.text_model.predict_proba(embeddings_2d)[0]
                confidence = float(np.max(probabilities))
                
                # Get all class probabilities with proper labels
                if self.label_encoder is not None:
                    class_names = self.label_encoder.classes_
                else:
                    class_names = self.categories
                
                class_probabilities = {
                    category: float(prob)
                    for category, prob in zip(class_names, probabilities)
                }
            
            logger.success(f"✓ Predicted category: {prediction}")
            
            return {
                "success": True,
                "prediction": prediction,
                "confidence": confidence,
                "probabilities": class_probabilities,
                "original_text": text,
                "cleaned_text": cleaned_text
            }
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            return {
                "success": False,
                "error": f"Prediction error: {str(e)}"
            }
    
    def batch_predict(self, texts: list[str]) -> list[Dict[str, Any]]:
        """
        Predict categories for multiple texts
        
        Args:
            texts: List of text strings
            
        Returns:
            List of prediction results
        """
        results = []
        
        for text in texts:
            result = self.predict(text)
            results.append(result)
        
        return results


# Global service instance
text_classification_service = TextClassificationService()