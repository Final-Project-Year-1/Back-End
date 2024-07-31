
import express from "express";
import verifyLoggedIn from "../middleware/verify-logged-in.js";
import verifyAdmin from "../middleware/verify-admin.js";
import ImageModel.js from "../image-model.js";

const router = express.Router

router.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
      const imagePath = req.file.path;
      const newImage = new ImageModel({ imagePath: imagePath });
      await newImage.save();
      res.send('File uploaded and saved to database successfully');
    } catch (error) {
      res.status(500).send('Error uploading and saving file');
    }
  });
  
  export default{
    router
  }