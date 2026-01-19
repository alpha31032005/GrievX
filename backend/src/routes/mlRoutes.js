const express = require("express");
const multer = require("multer");
const FormData = require("form-data");
const axios = require("axios");
const config = require("../config/env");
const mlService = require("../services/mlService");

const router = express.Router();
const upload = multer();


// TEXT CLASSIFICATION ------------------------------
router.post("/text", async (req, res) => {
  try {
    const { text } = req.body;
    const result = await mlService.classifyText(text);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Text classification failed" });
  }
});


// IMAGE CLASSIFICATION ------------------------------
router.post("/image", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(
      `${config.ML_SERVICE_URL}${config.ML_IMAGE_ENDPOINT}`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    res.json({
      prediction: response.data.prediction,
      confidence: response.data.confidence,
    });

  } catch (err) {
    console.error("Image ML proxy error:", err.response?.data || err.message);
    res.status(500).json({ 
      error: "Image classification failed",
      details: err.response?.data?.detail || err.message 
    });
  }
});


module.exports = router;
