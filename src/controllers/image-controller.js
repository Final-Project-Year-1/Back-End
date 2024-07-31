
import express from "express";
import multer from 'multer';
import path from 'path';
import verifyLoggedIn from "../middleware/verify-logged-in.js";
import verifyAdmin from "../middleware/verify-admin.js";
import ImageModel from "../models/review-model.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../assets/vacations/images');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const newImage = new ImageModel({ imagePath: imagePath });
    await newImage.save();
    res.send('File uploaded and saved to database successfully');
  } catch (error) {
    res.status(500).send('Error uploading and saving file');
  }
});

export default router;