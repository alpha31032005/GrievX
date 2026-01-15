"""
Text and Image Preprocessing Utilities
Handles cleaning, normalization, and transformation
"""

import re
import numpy as np
from PIL import Image
import cv2
from typing import Union
from io import BytesIO

from app.config import settings


class TextPreprocessor:
    """Handles text cleaning and normalization for Hindi/Marathi/English"""
    
    @staticmethod
    def clean_text(text: str) -> str:
        """
        Clean and normalize input text
        
        Args:
            text: Raw input text in any language
            
        Returns:
            Cleaned text string
        """
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+|www.\S+', '', text)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove extra whitespaces
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep Devanagari script (for Hindi/Marathi)
        # Keep alphanumeric, spaces, and Devanagari Unicode range (U+0900 to U+097F)
        text = re.sub(r'[^\w\s\u0900-\u097F]', '', text)
        
        # Strip leading/trailing whitespace
        text = text.strip()
        
        return text
    
    @staticmethod
    def truncate_text(text: str, max_length: int = None) -> str:
        """
        Truncate text to maximum length
        
        Args:
            text: Input text
            max_length: Maximum length (default from config)
            
        Returns:
            Truncated text
        """
        if max_length is None:
            max_length = settings.MAX_TEXT_LENGTH
        
        if len(text) > max_length:
            text = text[:max_length]
        
        return text
    
    @staticmethod
    def validate_text(text: str) -> tuple[bool, str]:
        """
        Validate if text is acceptable for processing
        
        Returns:
            (is_valid, error_message)
        """
        if not text or not text.strip():
            return False, "Text cannot be empty"
        
        if len(text.strip()) < 5:
            return False, "Text is too short (minimum 5 characters)"
        
        if len(text) > 5000:
            return False, "Text is too long (maximum 5000 characters)"
        
        return True, ""


class ImagePreprocessor:
    """Handles image preprocessing for CNN model"""
    
    @staticmethod
    def preprocess_image(
        image: Union[Image.Image, np.ndarray, bytes],
        target_size: tuple = None
    ) -> np.ndarray:
        """
        Preprocess image for CNN model
        
        Args:
            image: PIL Image, numpy array, or bytes
            target_size: Target size (height, width)
            
        Returns:
            Preprocessed numpy array ready for model
        """
        if target_size is None:
            target_size = settings.IMAGE_SIZE
        
        # Convert bytes to PIL Image if necessary
        if isinstance(image, bytes):
            image = Image.open(BytesIO(image))
        
        # Convert numpy array to PIL Image if necessary
        if isinstance(image, np.ndarray):
            image = Image.fromarray(image)
        
        # Convert to RGB if necessary (handles RGBA, grayscale, etc.)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to target size
        image = image.resize(target_size, Image.Resampling.LANCZOS)
        
        # Convert to numpy array
        img_array = np.array(image, dtype=np.float32)
        
        # Normalize pixel values to [0, 1]
        img_array = img_array / 255.0
        
        # Add batch dimension: (224, 224, 3) -> (1, 224, 224, 3)
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    @staticmethod
    def validate_image(image: Image.Image) -> tuple[bool, str]:
        """
        Validate if image is acceptable for processing
        
        Returns:
            (is_valid, error_message)
        """
        try:
            # Check if image is valid
            if image is None:
                return False, "Image is None"
            
            # Check image size (not too small)
            width, height = image.size
            if width < 50 or height < 50:
                return False, "Image is too small (minimum 50x50 pixels)"
            
            # Check file size (in memory)
            if hasattr(image, 'size'):
                # Estimate size in MB
                estimated_size = width * height * 3 / (1024 * 1024)
                if estimated_size > 10:  # 10 MB limit
                    return False, "Image is too large (maximum 10MB)"
            
            return True, ""
            
        except Exception as e:
            return False, f"Image validation error: {str(e)}"
    
    @staticmethod
    def enhance_image(image: np.ndarray) -> np.ndarray:
        """
        Optional: Apply image enhancement techniques
        Useful for low-quality images
        
        Args:
            image: Numpy array of image
            
        Returns:
            Enhanced image array
        """
        # Convert to uint8 for OpenCV operations
        img_uint8 = (image * 255).astype(np.uint8)
        
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        # Improves contrast in images
        lab = cv2.cvtColor(img_uint8, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        
        enhanced = cv2.merge([l, a, b])
        enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)
        
        # Convert back to float32 [0, 1]
        enhanced = enhanced.astype(np.float32) / 255.0
        
        return enhanced