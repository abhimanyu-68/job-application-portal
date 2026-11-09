const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { promisify } = require("util");

const pipeline = promisify(require("stream").pipeline);
const router = express.Router();

// Ensure directory exists
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Function to get file extension
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

// Dynamically import multer
let upload;
(async () => {
  const multer = await import("multer");
  upload = multer.default(); // Initialize multer
})();

// Resume Upload Endpoint
router.post("/resume", async (req, res) => {
  try {
    if (!upload) {
      return res.status(500).json({ message: "File upload service not initialized" });
    }

    const handler = upload.single("file");
    handler(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: "File upload error", error: err.message });
      }

      const { file } = req;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const extension = getFileExtension(file.originalname);
      if (extension !== ".pdf") {
        return res.status(400).json({ message: "Invalid format. Only PDF allowed." });
      }

      const filename = `${uuidv4()}${extension}`;
      const uploadPath = path.join(__dirname, "../public/resume");
      ensureDirectoryExists(uploadPath);

      await pipeline(
        file.stream,
        fs.createWriteStream(path.join(uploadPath, filename))
      );

      res.json({
        message: "File uploaded successfully",
        url: `/host/resume/${filename}`,
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error while uploading", error: err.message });
  }
});

// Profile Upload Endpoint
router.post("/profile", async (req, res) => {
  try {
    if (!upload) {
      return res.status(500).json({ message: "File upload service not initialized" });
    }

    const handler = upload.single("file");
    handler(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: "File upload error", error: err.message });
      }

      const { file } = req;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const extension = getFileExtension(file.originalname);
      if (extension !== ".jpg" && extension !== ".png") {
        return res.status(400).json({ message: "Invalid format. Only JPG and PNG allowed." });
      }

      const filename = `${uuidv4()}${extension}`;
      const uploadPath = path.join(__dirname, "../public/profile");
      ensureDirectoryExists(uploadPath);

      await pipeline(
        file.stream,
        fs.createWriteStream(path.join(uploadPath, filename))
      );

      res.json({
        message: "Profile image uploaded successfully",
        url: `/host/profile/${filename}`,
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error while uploading", error: err.message });
  }
});

module.exports = router;
