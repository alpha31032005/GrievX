"""
Model Loader - Handles loading and caching of ML models
Implements singleton pattern for efficient memory usage
"""

import joblib
import tensorflow as tf
import keras
from sentence_transformers import SentenceTransformer
from loguru import logger
from typing import Optional
from pathlib import Path

from app.config import settings


class ModelLoader:
    """Singleton class to load and cache ML models"""
    
    _instance = None
    _text_model = None
    _image_model = None
    _embedder = None
    _label_encoder = None
    
    def __new__(cls):
        """Ensure only one instance exists (Singleton pattern)"""
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
        return cls._instance
    
    def load_text_classifier(self) -> object:
        """
        Load the text classification model (.pkl file)
        Returns: Loaded scikit-learn model
        """
        if self._text_model is None:
            try:
                logger.info(f"Loading text classifier from {settings.TEXT_MODEL_PATH}")
                
                if not settings.TEXT_MODEL_PATH.exists():
                    raise FileNotFoundError(
                        f"Text model not found at {settings.TEXT_MODEL_PATH}. "
                        f"Please place your text_classifier.pkl file in the models directory."
                    )
                
                # Use joblib to load the model
                self._text_model = joblib.load(settings.TEXT_MODEL_PATH)
                
                logger.success("✓ Text classifier loaded successfully")
                
            except Exception as e:
                logger.error(f"Failed to load text classifier: {str(e)}")
                raise
        
        return self._text_model
    
    def load_label_encoder(self) -> object:
        """
        Load the label encoder
        Returns: Loaded LabelEncoder
        """
        if self._label_encoder is None:
            try:
                encoder_path = settings.MODELS_DIR / "label_encoder.pkl"
                logger.info(f"Loading label encoder from {encoder_path}")
                
                if not encoder_path.exists():
                    logger.warning("Label encoder not found, predictions will use raw labels")
                    return None
                
                self._label_encoder = joblib.load(encoder_path)
                logger.success("✓ Label encoder loaded successfully")
                
            except Exception as e:
                logger.warning(f"Failed to load label encoder: {str(e)}")
                return None
        
        return self._label_encoder
    
    def load_embedder(self) -> SentenceTransformer:
        """
        Load mBERT sentence transformer for multilingual embeddings
        Supports Hindi, Marathi, English
        Returns: SentenceTransformer model
        """
        if self._embedder is None:
            try:
                # Try to load custom embedder first
                custom_embedder_path = settings.MODELS_DIR / "multilingual_embedder"
                
                if custom_embedder_path.exists():
                    logger.info(f"Loading custom embedder from {custom_embedder_path}")
                    self._embedder = SentenceTransformer(str(custom_embedder_path))
                    logger.success("✓ Custom mBERT embedder loaded successfully")
                else:
                    # Fallback to downloading from HuggingFace
                    logger.info(f"Custom embedder not found, downloading: {settings.MBERT_MODEL}")
                    self._embedder = SentenceTransformer(settings.MBERT_MODEL)
                    logger.success("✓ mBERT embedder downloaded and loaded successfully")
                
            except Exception as e:
                logger.error(f"Failed to load embedder: {str(e)}")
                raise
        
        return self._embedder
    
    def load_image_classifier(self) ->keras.Model:
        """
        Load the image classification model (.h5 file)
        WARNING: Model may be incompatible with TensorFlow 2.15+
        Gracefully handles legacy model format issues
        Returns: Loaded Keras model or None if loading fails
        """
        if self._image_model is None:
            try:
                logger.info(f"Loading image classifier from {settings.IMAGE_MODEL_PATH}")
                
                if not settings.IMAGE_MODEL_PATH.exists():
                    raise FileNotFoundError(
                        f"Image model not found at {settings.IMAGE_MODEL_PATH}. "
                        f"Please place your image_classifier.h5 file in the models directory."
                    )
                
                # Try standard loading
                self._image_model = tf.keras.models.load_model(
                    str(settings.IMAGE_MODEL_PATH),
                    compile=False
                )
                
                # Compile for inference
                try:
                    if not self._image_model.compiled:
                        self._image_model.compile(
                            optimizer='adam',
                            loss='sparse_categorical_crossentropy',
                            metrics=['accuracy']
                        )
                except:
                    pass
                
                logger.success("✓ Image classifier loaded successfully")
                logger.info(f"Model input shape: {self._image_model.input_shape}")
                
            except Exception as e:
                logger.error(f"Failed to load image classifier: {str(e)}")
                logger.warning("⚠️  Image model is incompatible with current TensorFlow version.")
                logger.warning("    Please retrain the model with TensorFlow 2.15+ or use TensorFlow 2.12")
                self._image_model = None  # Set to None instead of raising
        
        return self._image_model
    
    def get_model_info(self) -> dict:
        """Return information about loaded models"""
        return {
            "text_model_loaded": self._text_model is not None,
            "image_model_loaded": self._image_model is not None,
            "embedder_loaded": self._embedder is not None,
            "label_encoder_loaded": self._label_encoder is not None,
            "categories": settings.CATEGORIES,
            "image_size": settings.IMAGE_SIZE
        }


# Global model loader instance
model_loader = ModelLoader()