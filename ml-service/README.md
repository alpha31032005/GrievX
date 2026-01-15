# 🤖 Smart Civic ML Service

Machine Learning microservice for classifying civic issues from text and images.

## 🎯 Features

- **Text Classification**: Multilingual support (Hindi, Marathi, English)
- **Image Classification**: CNN-based image recognition
- **Real-time API**: Fast predictions via REST API
- **Batch Processing**: Handle multiple requests efficiently
- **Health Monitoring**: Built-in health checks

## 📋 Categories

The system classifies civic issues into 4 categories:

1. **Potholes** - Road damage and holes
2. **Garbage** - Waste accumulation
3. **Fallen Trees** - Damaged or fallen trees
4. **Electric Poles** - Damaged electrical infrastructure

## 🚀 Quick Start

### Prerequisites

- Python 3.10 or higher
- Virtual environment (recommended)
- Your trained models:
  - `text_classifier.pkl`
  - `image_classifier.keras`

### Installation

1. **Create virtual environment**:
```bash
python -m venv mlenv
mlenv\Scripts\activate  # Windows
source mlenv/bin/activate  # Mac/Linux
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Place model files**:
```
app/models/
├── text_classifier.pkl
└── image_classifier.keras
```

4. **Start the service**:
```bash
python -m app.main
```

The service will start on `http://localhost:8000`

## 📖 API Documentation

Once running, visit:
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 🔌 API Endpoints

### Text Classification

**POST** `/ml/text/classify`
```json
{
  "text": "रस्त्यावर मोठे खड्डे पडलेत"
}
```

**Response**:
```json
{
  "success": true,
  "prediction": "potholes",
  "confidence": 0.95,
  "probabilities": {
    "potholes": 0.95,
    "garbage": 0.03,
    "fallen_trees": 0.01,
    "electric_poles": 0.01
  }
}
```

### Image Classification

**POST** `/ml/image/classify`
- Upload image file (JPG, PNG)
- Optional: `enhance=true` for image enhancement

**Response**:
```json
{
  "success": true,
  "prediction": "garbage",
  "confidence": 0.87,
  "image_size": [1920, 1080]
}
```

### Health Check

**GET** `/health`

Returns service status and loaded models information.

## 🏗️ Architecture
```
FastAPI Server
    ↓
Model Loader (Singleton)
    ↓
├── Text Service
│   ├── mBERT Embeddings
│   └── Scikit-learn Classifier
│
└── Image Service
    ├── Image Preprocessing
    └── CNN Classifier
```

## 🔧 Configuration

Edit `.env` file:
```bash
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO
```

## 🧪 Testing

Run the test script:
```bash
python test_api.py
```

Or use the interactive docs at `/docs`

## 📊 Model Details

### Text Classification
- **Embeddings**: mBERT (multilingual)
- **Classifier**: Scikit-learn (your trained model)
- **Languages**: Hindi, Marathi, English

### Image Classification
- **Model**: CNN (your trained Keras model)
- **Input Size**: 224x224 pixels
- **Format**: RGB images

## 🐛 Troubleshooting

### Models not loading
- Verify files are in `app/models/`
- Check filenames match exactly
- Ensure models are compatible with TensorFlow 2.15

### Import errors
- Activate virtual environment
- Reinstall dependencies: `pip install -r requirements.txt`

### Port already in use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

## 📞 Support

For issues or questions:
1. Check the logs (detailed error messages)
2. Run diagnostic: `python diagnose_setup.py`
3. Verify all dependencies installed

## 📄 License

Part of Smart Civic Issue Reporting System

## 🔄 Version

Current Version: 1.0.0