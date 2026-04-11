import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB Limit
});

router.get("/", (req, res) => {
  try {
    if (!fs.existsSync(uploadDir)) {
      return res.json([]);
    }
    const files = fs.readdirSync(uploadDir);
    const media = files.map(file => {
      const stats = fs.statSync(path.join(uploadDir, file));
      return {
        name: file,
        url: `/uploads/${file}`,
        path: path.join(uploadDir, file),
        size: stats.size,
        createdAt: stats.birthtime
      };
    });

    // Sort by newest first
    media.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json(media);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch media list" });
  }
});

router.delete("/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ message: "File deleted successfully" });
    }
    res.status(404).json({ error: "File not found" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete media" });
  }
});

router.post("/", (req, res, next) => {
  console.log("Debug: Received request at /api/upload");
  next();
}, upload.single("image"), (req, res) => {
  console.log("Debug: Processing file upload...");
  if (!req.file) {
    console.error("Debug: No file found in request");
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  console.log(`Debug: File uploaded successfully: ${fileUrl}`);
  res.json({ url: fileUrl });
});

export default router;
