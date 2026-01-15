"""
Model Converter - Converts old Keras models to TensorFlow 2.15 compatible format
Patches the model config to use 'input_shape' instead of deprecated 'batch_shape'
"""

import json
import zipfile
from pathlib import Path
import tempfile
import shutil

def convert_keras_model(input_path: str, output_path: str = None):
    """
    Convert old Keras model to TensorFlow 2.15 compatible format.
    
    Args:
        input_path: Path to source model (image_classifier.keras or .h5)
        output_path: Path to save converted model (defaults to same name with _converted)
    """
    input_path = Path(input_path)
    
    if output_path is None:
        output_path = input_path.parent / f"{input_path.stem}_converted{input_path.suffix}"
    else:
        output_path = Path(output_path)
    
    print(f"Converting model: {input_path} -> {output_path}")
    
    # If it's a .keras file (zip format), we can patch the config
    if input_path.suffix == ".keras":
        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                tmpdir = Path(tmpdir)
                
                # Extract .keras file (it's a zip)
                with zipfile.ZipFile(input_path, 'r') as zip_ref:
                    zip_ref.extractall(tmpdir)
                
                # Find and patch config.json
                config_file = tmpdir / "config.json"
                if config_file.exists():
                    with open(config_file, 'r') as f:
                        config = json.load(f)
                    
                    # Recursively fix batch_shape -> input_shape
                    config = _fix_batch_shape_recursive(config)
                    
                    with open(config_file, 'w') as f:
                        json.dump(config, f, indent=2)
                    
                    print("✓ Fixed batch_shape parameters in config.json")
                
                # Recreate .keras file with fixed config
                with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zip_ref:
                    for file_path in tmpdir.rglob("*"):
                        if file_path.is_file():
                            arcname = file_path.relative_to(tmpdir)
                            zip_ref.write(file_path, arcname)
                
                print(f"✓ Model converted successfully: {output_path}")
                return output_path
        
        except Exception as e:
            print(f"✗ Conversion failed: {e}")
            raise
    else:
        print(f"⚠ Skipping .h5 model conversion (use .keras format for best results)")
        return input_path


def _fix_batch_shape_recursive(obj):
    """Recursively fix batch_shape to input_shape in config objects"""
    if isinstance(obj, dict):
        # If this is an InputLayer config with batch_shape, convert it
        if obj.get('class_name') == 'InputLayer' and 'config' in obj:
            config = obj['config']
            if 'batch_shape' in config:
                # batch_shape format: [batch_size, ...dims]
                # input_shape format: [...dims] (without batch)
                batch_shape = config.pop('batch_shape')
                if batch_shape and len(batch_shape) > 1:
                    config['input_shape'] = batch_shape[1:]  # Remove batch dimension
                print(f"  Fixed {config.get('name', 'InputLayer')}: batch_shape -> input_shape")
        
        # Recursively process all dict values
        return {key: _fix_batch_shape_recursive(value) for key, value in obj.items()}
    
    elif isinstance(obj, list):
        # Recursively process all list items
        return [_fix_batch_shape_recursive(item) for item in obj]
    
    else:
        return obj


if __name__ == "__main__":
    # Convert the image classifier model
    models_dir = Path(__file__).parent / "app" / "models"
    keras_model = models_dir / "image_classifier.keras"
    h5_model = models_dir / "image_classifier.h5"
    
    if keras_model.exists():
        try:
            convert_keras_model(keras_model, keras_model)
            print(f"\n✓ Successfully converted {keras_model.name}")
        except Exception as e:
            print(f"✗ Failed to convert .keras model: {e}")
    
    if h5_model.exists() and not keras_model.exists():
        print(f"\n⚠ .h5 model found but .keras format recommended")
        print("  Please use the .keras version or retrain the model with TensorFlow 2.15")
