import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ImageUploader from "../../components/citizen/ImageUploader";
import { FiCpu, FiLoader, FiCheckCircle, FiArrowLeft, FiHome, FiMapPin } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";

const ComplaintForm = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    description: "",
    location: "",
    image: null,
  });
  
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePrediction, setImagePrediction] = useState(null);
  const [textPrediction, setTextPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Handle image upload and ML classification
  const uploadImage = async (file) => {
    setFormData({ ...formData, image: file });
    setUploadedImage(URL.createObjectURL(file));
    setLoading(true);
    setImagePrediction(null);
    setError("");

    const formDataImg = new FormData();
    formDataImg.append("file", file);

    try {
      const response = await api.post("/ml/image", formDataImg, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImagePrediction(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Image classification error:", err);
      setError("Failed to classify image. Please try again.");
      setLoading(false);
    }
  };

  // Handle text change and classify when user stops typing
  const handleDescriptionChange = (e) => {
    const text = e.target.value;
    setFormData({ ...formData, description: text });
    
    // Clear previous text prediction
    setTextPrediction(null);
  };

  // Classify text description
  const classifyText = async () => {
    if (!formData.description.trim()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const response = await api.post("/ml/text", {
        text: formData.description,
      });
      setTextPrediction(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Text classification error:", err);
      setError("Failed to classify text. Please try again.");
      setLoading(false);
    }
  };

  // Determine best category from predictions
  const getBestCategory = () => {
    if (!imagePrediction && !textPrediction) return null;
    
    const predictions = [];
    
    if (imagePrediction) {
      predictions.push({
        category: imagePrediction.prediction || imagePrediction.category,
        confidence: imagePrediction.confidence || 0,
        source: "image",
      });
    }
    
    if (textPrediction) {
      predictions.push({
        category: textPrediction.prediction || textPrediction.category,
        confidence: textPrediction.confidence || 0,
        source: "text",
      });
    }
    
    // Return prediction with highest confidence
    return predictions.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
  };

  // Submit complaint
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      setError("Please provide a description");
      return;
    }
    
    if (!formData.image) {
      setError("Please upload an image");
      return;
    }
    
    const bestPrediction = getBestCategory();
    if (!bestPrediction) {
      setError("Please wait for classification to complete");
      return;
    }
    
    setSubmitting(true);
    setError("");
    
    try {
      const submitData = new FormData();
      submitData.append("description", formData.description);
      submitData.append("location", formData.location);
      submitData.append("category", bestPrediction.category);
      submitData.append("image", formData.image);
      
      await api.post("/complaints", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Redirect to my complaints page
      navigate("/citizen/my-complaints");
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.message || "Failed to submit complaint. Please try again.");
      setSubmitting(false);
    }
  };

  const bestCategory = getBestCategory();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="px-4 py-10">
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-400 opacity-20 blur-3xl rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-accent-info opacity-20 blur-3xl rounded-full"></div>
        </div>

        {/* Main Container */}
        <div className="relative z-10 max-w-3xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/citizen/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <FiHome className="w-4 h-4" />
              <span>/</span>
              <Link to="/citizen/dashboard" className="hover:text-primary-600 dark:hover:text-primary-400 transition">Dashboard</Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white font-semibold">File Complaint</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                File a New Complaint
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Upload an image and describe the issue. AI will classify it automatically.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                  {error}
                </div>
              )}

              {/* Description Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  onBlur={classifyText}
                  placeholder="Describe the civic issue in detail..."
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 outline-none transition"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Text will be auto-classified when you finish typing
                </p>
              </div>

              {/* Location Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiMapPin className="inline w-4 h-4 mr-1" />
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Main Street near City Hall"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 outline-none transition"
                />
              </div>

              {/* Image Uploader */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Upload Image *
                </label>
                <ImageUploader onUpload={uploadImage} />
              </div>

              {/* Image Preview */}
              {uploadedImage && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-3">
                    Image Preview
                  </h3>
                  <img
                    src={uploadedImage}
                    alt="Uploaded Preview"
                    className="rounded-xl shadow-lg max-h-80 w-full object-cover"
                  />
                </div>
              )}

              {/* Loading Animation */}
              {loading && (
                <div className="mt-6 flex flex-col items-center text-center p-6 bg-primary-50 dark:bg-primary-900/20 rounded-lg animate-pulse">
                  <FiLoader className="w-10 h-10 text-primary-600 dark:text-primary-400 animate-spin" />
                  <p className="text-gray-700 dark:text-gray-300 mt-3 font-medium">
                    Analyzing with AI...
                  </p>
                </div>
              )}

              {/* Classification Results */}
              {(imagePrediction || textPrediction) && !loading && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <FiCpu className="text-primary-600 dark:text-primary-400" />
                    AI Classification Results
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Image Prediction */}
                    {imagePrediction && (
                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Image Classification</p>
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-400 capitalize">
                          {imagePrediction.prediction || imagePrediction.category}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Confidence: {((imagePrediction.confidence || 0) * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}

                    {/* Text Prediction */}
                    {textPrediction && (
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Text Classification</p>
                        <p className="text-lg font-bold text-green-700 dark:text-green-400 capitalize">
                          {textPrediction.prediction || textPrediction.category}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Confidence: {((textPrediction.confidence || 0) * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Best Category */}
                  {bestCategory && (
                    <div className="p-4 rounded-lg bg-gradient-to-r from-primary-100 to-accent-success/20 dark:from-primary-900/30 dark:to-accent-success/20 border-2 border-primary-500 dark:border-primary-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Selected Category (Best Confidence)</p>
                      <p className="text-2xl font-bold text-primary-700 dark:text-primary-400 capitalize">
                        {bestCategory.category}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {(bestCategory.confidence * 100).toFixed(1)}% confident • From {bestCategory.source}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || loading || !formData.description || !formData.image}
                className={`w-full py-4 rounded-lg font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                  submitting || loading || !formData.description || !formData.image
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 hover:shadow-xl hover:scale-[1.02]'
                }`}
              >
                {submitting ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="w-5 h-5" />
                    Submit Complaint
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
