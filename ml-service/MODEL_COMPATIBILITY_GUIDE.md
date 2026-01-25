# Model Compatibility Guide

## Overview

This guide addresses model compatibility issues in the Smart Civic ML Service, particularly focusing on the transition between different versions of TensorFlow and Keras. Understanding these compatibility issues is essential for ensuring smooth operation of the machine learning service.

## Table of Contents

- [Understanding the Issue](#understanding-the-issue)
- [Model Formats](#model-formats)
- [TensorFlow Version Compatibility](#tensorflow-version-compatibility)
- [Solution Options](#solution-options)
- [Model Migration Guide](#model-migration-guide)
- [Testing and Validation](#testing-and-validation)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Understanding the Issue

### The Problem

The image classifier model may have been trained using older versions of Keras that use deprecated parameters. Specifically, older Keras models use the `batch_shape` parameter in InputLayer configurations, which has been replaced with `input_shape` in TensorFlow 2.15 and later versions.

When you try to load an older model in TensorFlow 2.15+, you may encounter errors like:

```
TypeError: InputLayer.__init__() got an unexpected keyword argument 'batch_shape'
```

### Why This Happens

TensorFlow and Keras have undergone significant changes:

- **TensorFlow 1.x to 2.x**: Major API changes, eager execution by default
- **Keras 2.x to 3.x**: Transition from standalone Keras to integrated TensorFlow Keras
- **TensorFlow 2.12 to 2.15**: Removal of deprecated legacy parameters

Models trained with older versions may contain configuration parameters that are no longer supported in newer versions.

### Current System Status

The ML service uses multiple models with different compatibility requirements:

**Text Classification Models**:
- Status: Fully Compatible
- Format: Pickle (.pkl) files
- Dependencies: scikit-learn, sentence-transformers
- No compatibility issues

**Label Encoder**:
- Status: Fully Compatible
- Format: Pickle (.pkl) file
- Dependencies: scikit-learn
- No compatibility issues

**mBERT Embedder**:
- Status: Fully Compatible
- Model: paraphrase-multilingual-MiniLM-L12-v2
- Dependencies: sentence-transformers, PyTorch
- No compatibility issues

**Image Classifier**:
- Status: May require compatibility fixes
- Format: HDF5 (.h5) or Keras native (.keras)
- Dependencies: TensorFlow, Keras
- Potential compatibility issues with TensorFlow 2.15+

## Model Formats

### HDF5 Format (.h5)

The legacy format used by Keras for saving models.

**Advantages**:
- Widely used and supported
- Compatible with older tools
- Well-documented

**Disadvantages**:
- May contain deprecated configuration parameters
- Less flexible for version migration
- Potential compatibility issues with newer TensorFlow versions

**Saving in HDF5 format**:
```python
model.save('image_classifier.h5')
```

**Loading HDF5 format**:
```python
model = tf.keras.models.load_model('image_classifier.h5')
```

### Keras Native Format (.keras)

The new recommended format introduced in Keras 3.0.

**Advantages**:
- Better forward compatibility
- Cleaner architecture information
- Zip-based structure, easier to inspect and modify
- Official recommended format

**Disadvantages**:
- Not supported in very old TensorFlow versions
- Requires TensorFlow 2.13+

**Saving in Keras native format**:
```python
model.save('image_classifier.keras')
```

**Loading Keras native format**:
```python
model = tf.keras.models.load_model('image_classifier.keras')
```

### SavedModel Format

TensorFlow's universal format for model serialization.

**Advantages**:
- Most flexible format
- Best for production deployment
- Supports TensorFlow Serving
- Language-agnostic

**Disadvantages**:
- Directory structure instead of single file
- Larger file size

**Saving as SavedModel**:
```python
model.save('saved_model_directory/')
```

## TensorFlow Version Compatibility

### Version Comparison

**TensorFlow 2.12**:
- Good backward compatibility with older models
- Supports `batch_shape` parameter
- Stable and well-tested
- Recommended for legacy models

**TensorFlow 2.13-2.14**:
- Transition period
- Some deprecated features still work with warnings
- Introduction of Keras 3.0 support

**TensorFlow 2.15+**:
- Stricter compatibility checks
- Deprecated parameters removed
- Better performance and features
- Requires models to use current standards

### Dependency Matrix

| TensorFlow Version | Keras Version | Python Version | Legacy Model Support |
|-------------------|---------------|----------------|---------------------|
| 2.12.0            | 2.12.0        | 3.8 - 3.11     | Excellent           |
| 2.13.0            | 2.13.0        | 3.8 - 3.11     | Good                |
| 2.14.0            | 2.14.0        | 3.9 - 3.11     | Moderate            |
| 2.15.0            | 2.15.0        | 3.9 - 3.12     | Limited             |

### Checking Your Current Version

To check your installed versions:

```bash
python -c "import tensorflow as tf; print(f'TensorFlow: {tf.__version__}')"
python -c "import keras; print(f'Keras: {keras.__version__}')"
```

Or using the test script:

```bash
python test_tf.py
```

## Solution Options

### Option 1: Retrain the Model (Recommended)

This is the best long-term solution.

**Steps**:

1. Set up your environment with TensorFlow 2.15:
```bash
pip install tensorflow==2.15.0
```

2. Load your training data and retrain:
```python
import tensorflow as tf
from tensorflow import keras

# Build your model
model = keras.Sequential([
    keras.layers.InputLayer(input_shape=(224, 224, 3)),
    keras.layers.Conv2D(32, (3, 3), activation='relu'),
    # ... other layers
])

# Train the model
model.fit(X_train, y_train, epochs=10)

# Save in the new format
model.save('app/models/image_classifier.keras')
```

3. Place the new model in the models directory
4. Restart the ML service

**Advantages**:
- Future-proof solution
- Best performance with current TensorFlow
- Opportunity to improve model architecture
- Can take advantage of new features

**Disadvantages**:
- Requires training data
- Time-consuming
- May need hyperparameter tuning

### Option 2: Downgrade TensorFlow (Quick Fix)

Use TensorFlow 2.12 which has better backward compatibility.

**Steps**:

1. Activate your virtual environment:
```bash
# Windows
mlenv\Scripts\activate

# Linux/Mac
source mlenv/bin/activate
```

2. Uninstall current TensorFlow:
```bash
pip uninstall tensorflow
```

3. Install TensorFlow 2.12:
```bash
pip install tensorflow==2.12.0
```

4. Verify installation:
```bash
python -c "import tensorflow as tf; print(tf.__version__)"
```

5. Restart the ML service:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Advantages**:
- Quick and easy
- No need for training data
- Immediate solution
- Existing model works without changes

**Disadvantages**:
- Not future-proof
- Missing newer TensorFlow features
- May have security vulnerabilities over time

### Option 3: Convert Model Format

Use the provided conversion script to update the model configuration.

**Steps**:

1. Ensure the model is in Keras native format:
```bash
python convert_model.py
```

2. The script will:
   - Extract the model's configuration
   - Replace `batch_shape` with `input_shape`
   - Save the converted model

3. Replace the old model with the converted one:
```bash
# Backup original
mv app/models/image_classifier.h5 app/models/image_classifier.h5.backup

# Use converted model
mv app/models/image_classifier_converted.keras app/models/image_classifier.keras
```

4. Update `config.py` if needed:
```python
IMAGE_MODEL_PATH: Path = MODELS_DIR / "image_classifier.keras"
```

5. Restart the ML service

**Advantages**:
- No retraining required
- Works with current TensorFlow
- Automated process

**Disadvantages**:
- May not work for all model architectures
- Only fixes specific known issues
- Complex models might have other compatibility problems

### Option 4: Use Model Without Image Classification

Temporarily disable image classification while you work on a permanent fix.

**Steps**:

1. The ML service is already designed to handle missing models gracefully
2. Comment out or remove image classification routes in `app/routes/image_routes.py`
3. Focus on text-based classification which works correctly

**Advantages**:
- Immediate workaround
- Text classification continues to work
- No downtime

**Disadvantages**:
- Reduced functionality
- Not a permanent solution
- User experience degraded for image-based complaints

## Model Migration Guide

### Complete Model Retraining Workflow

#### Step 1: Prepare Environment

Create a training environment:

```bash
# Create training directory
mkdir model_training
cd model_training

# Create virtual environment
python -m venv train_env

# Activate
# Windows: train_env\Scripts\activate
# Linux/Mac: source train_env/bin/activate

# Install dependencies
pip install tensorflow==2.15.0 numpy pandas pillow scikit-learn matplotlib
```

#### Step 2: Prepare Training Data

Organize your image data:

```
training_data/
├── potholes/
│   ├── image001.jpg
│   ├── image002.jpg
│   └── ...
├── garbage/
│   ├── image001.jpg
│   └── ...
├── fallen_trees/
│   └── ...
└── electric_poles/
    └── ...
```

#### Step 3: Training Script

Create a training script `train_image_classifier.py`:

```python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np
from pathlib import Path

# Configuration
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 20
CATEGORIES = ["potholes", "garbage", "fallen_trees", "electric_poles"]

# Load data
data_dir = Path("training_data")
train_ds = tf.keras.utils.image_dataset_from_directory(
    data_dir,
    validation_split=0.2,
    subset="training",
    seed=123,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    data_dir,
    validation_split=0.2,
    subset="validation",
    seed=123,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE
)

# Build model
model = keras.Sequential([
    layers.InputLayer(input_shape=(224, 224, 3)),
    layers.Rescaling(1./255),
    layers.Conv2D(32, 3, activation='relu'),
    layers.MaxPooling2D(),
    layers.Conv2D(64, 3, activation='relu'),
    layers.MaxPooling2D(),
    layers.Conv2D(128, 3, activation='relu'),
    layers.MaxPooling2D(),
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(len(CATEGORIES), activation='softmax')
])

# Compile
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# Train
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS
)

# Save model
model.save('image_classifier.keras')
print("Model saved successfully!")

# Evaluate
val_loss, val_acc = model.evaluate(val_ds)
print(f"Validation accuracy: {val_acc:.2%}")
```

#### Step 4: Deploy New Model

```bash
# Copy to ML service
cp image_classifier.keras ../ml-service/app/models/

# Restart ML service
cd ../ml-service
uvicorn app.main:app --reload
```

### Converting Existing Models

#### Using the Conversion Script

The provided `convert_model.py` script can help:

```python
from convert_model import convert_keras_model

# Convert the model
convert_keras_model(
    input_path="app/models/image_classifier.keras",
    output_path="app/models/image_classifier_converted.keras"
)
```

#### Manual Conversion Process

If automated conversion fails:

1. Load the model in a compatible environment (TensorFlow 2.12):
```python
import tensorflow as tf

# Load in TF 2.12
model = tf.keras.models.load_model('old_model.h5')

# Get the config
config = model.get_config()

# Rebuild from config (this will use current API)
new_model = tf.keras.Model.from_config(config)

# Copy weights
new_model.set_weights(model.get_weights())

# Save in new format
new_model.save('new_model.keras')
```

2. Transfer the converted model to your TensorFlow 2.15 environment

## Testing and Validation

### Testing Model Loading

Create a test script `test_models.py`:

```python
"""Test script to verify model loading"""
import tensorflow as tf
from pathlib import Path

def test_image_model():
    model_path = Path("app/models/image_classifier.keras")
    
    try:
        print(f"Loading model from: {model_path}")
        model = tf.keras.models.load_model(str(model_path))
        print(f"Success! Model loaded.")
        print(f"Input shape: {model.input_shape}")
        print(f"Output shape: {model.output_shape}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print(f"TensorFlow version: {tf.__version__}")
    success = test_image_model()
    print(f"\nTest {'PASSED' if success else 'FAILED'}")
```

Run the test:
```bash
python test_models.py
```

### Testing Predictions

Test the model with a sample image:

```python
import tensorflow as tf
from PIL import Image
import numpy as np

# Load model
model = tf.keras.models.load_model('app/models/image_classifier.keras')

# Load and preprocess image
img = Image.open('test_image.jpg').resize((224, 224))
img_array = np.array(img) / 255.0
img_array = np.expand_dims(img_array, axis=0)

# Make prediction
predictions = model.predict(img_array)
categories = ["potholes", "garbage", "fallen_trees", "electric_poles"]

print("Predictions:")
for cat, prob in zip(categories, predictions[0]):
    print(f"  {cat}: {prob:.2%}")
```

### Integration Testing

Test the complete ML service:

```bash
# Start the service
uvicorn app.main:app --reload

# In another terminal, test the endpoints
curl http://localhost:8000/health

# Test image classification
curl -X POST http://localhost:8000/classify/image \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,..."}'
```

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Model Won't Load

**Error**: `FileNotFoundError: Model file not found`

**Solution**:
- Verify the model file exists in `app/models/`
- Check file permissions
- Ensure the path in `config.py` is correct

#### Issue 2: Incompatible Model Format

**Error**: `InputLayer got unexpected keyword argument 'batch_shape'`

**Solution**:
- Use TensorFlow 2.12 (Option 2)
- Retrain the model (Option 1)
- Run conversion script (Option 3)

#### Issue 3: Out of Memory

**Error**: `ResourceExhaustedError: OOM when allocating tensor`

**Solution**:
```python
# Limit GPU memory growth
import tensorflow as tf

gpus = tf.config.list_physical_devices('GPU')
if gpus:
    for gpu in gpus:
        tf.config.experimental.set_memory_growth(gpu, True)
```

#### Issue 4: Slow Predictions

**Problem**: Image classification takes too long

**Solution**:
- Use model quantization
- Enable GPU acceleration
- Reduce image size
- Use batch processing

#### Issue 5: Version Conflicts

**Error**: `ImportError: cannot import name 'xyz'`

**Solution**:
```bash
# Create clean environment
python -m venv fresh_env
source fresh_env/bin/activate  # or fresh_env\Scripts\activate on Windows

# Install specific versions
pip install tensorflow==2.15.0 keras==2.15.0
```

### Debugging Tips

1. **Check TensorFlow installation**:
```python
import tensorflow as tf
print(tf.__version__)
print(tf.config.list_physical_devices())
```

2. **Verify model structure**:
```python
model = tf.keras.models.load_model('model.keras')
model.summary()
```

3. **Enable verbose logging**:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

4. **Test with minimal example**:
```python
# Create and save a simple model
import tensorflow as tf

model = tf.keras.Sequential([
    tf.keras.layers.InputLayer(input_shape=(10,)),
    tf.keras.layers.Dense(1)
])
model.save('test_model.keras')

# Try loading
loaded = tf.keras.models.load_model('test_model.keras')
print("Success!")
```

## Best Practices

### Model Development

1. **Always use the latest stable TensorFlow version for new models**
2. **Save models in Keras native format (.keras)**
3. **Version your models** (e.g., `image_classifier_v2.keras`)
4. **Document model architecture and training parameters**
5. **Keep training scripts in version control**

### Model Deployment

1. **Test models in staging environment before production**
2. **Keep backup copies of working models**
3. **Monitor model performance in production**
4. **Log prediction confidence scores**
5. **Implement fallback mechanisms**

### Dependency Management

1. **Pin dependency versions in requirements.txt**:
```
tensorflow==2.15.0
keras==2.15.0
```

2. **Use virtual environments for isolation**
3. **Document compatible version combinations**
4. **Regular security updates**
5. **Test after dependency updates**

### Documentation

1. **Document model training process**
2. **Record model performance metrics**
3. **Keep migration notes**
4. **Document known issues and workarounds**
5. **Maintain compatibility matrix**

## Additional Resources

### Official Documentation

- [TensorFlow Documentation](https://www.tensorflow.org/api_docs)
- [Keras Documentation](https://keras.io/)
- [TensorFlow Model Saving Guide](https://www.tensorflow.org/guide/keras/save_and_serialize)

### Migration Guides

- [TensorFlow 2.x Migration Guide](https://www.tensorflow.org/guide/migrate)
- [Keras 3 Migration Guide](https://keras.io/guides/migrating_to_keras_3/)

### Community Resources

- [TensorFlow GitHub Issues](https://github.com/tensorflow/tensorflow/issues)
- [Stack Overflow TensorFlow Tag](https://stackoverflow.com/questions/tagged/tensorflow)

## Version History

- **v1.0** (January 2026): Initial compatibility guide
  - Documented TensorFlow 2.15 compatibility issues
  - Provided migration solutions
  - Added troubleshooting section

---

**Last Updated**: January 2026  
**Maintained By**: Smart Civic Development Team  
**Questions**: Refer to the main documentation or contact the development team
