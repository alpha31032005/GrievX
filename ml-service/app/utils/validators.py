"""
Input validation utilities
"""

from typing import Tuple
from pydantic import BaseModel, Field, validator


class TextInput(BaseModel):
    """Validator for text input"""
    text: str = Field(..., min_length=5, max_length=5000)
    
    @validator('text')
    def text_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Text cannot be empty or whitespace only')
        return v.strip()


class ImageInput(BaseModel):
    """Validator for image input"""
    max_size_mb: int = Field(default=10, ge=1, le=20)
    min_dimension: int = Field(default=50, ge=10)
    
    @staticmethod
    def validate_size(file_size: int, max_mb: int = 10) -> Tuple[bool, str]:
        """
        Validate file size
        
        Args:
            file_size: Size in bytes
            max_mb: Maximum size in MB
            
        Returns:
            (is_valid, error_message)
        """
        max_bytes = max_mb * 1024 * 1024
        if file_size > max_bytes:
            return False, f"File too large. Maximum {max_mb}MB allowed"
        return True, ""
    
    @staticmethod
    def validate_dimensions(width: int, height: int, min_dim: int = 50) -> Tuple[bool, str]:
        """
        Validate image dimensions
        
        Args:
            width: Image width
            height: Image height
            min_dim: Minimum dimension
            
        Returns:
            (is_valid, error_message)
        """
        if width < min_dim or height < min_dim:
            return False, f"Image too small. Minimum {min_dim}x{min_dim} pixels required"
        return True, ""