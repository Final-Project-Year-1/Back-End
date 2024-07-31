import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import ImageModel from '../models/image-model.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../assets/images/vacations');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const imagePath = `${req.file.filename}`;
    const newImage = new ImageModel({ imagePath: imagePath });
    await newImage.save();
    res.send({ message: 'File uploaded and saved to database successfully', imagePath });
  } catch (error) {
    console.error('Error uploading and saving file:', error);
    res.status(500).send('Error uploading and saving file');
  }
});

export default router;
