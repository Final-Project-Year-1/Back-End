import express from "express";
import dal from "./src/dal.js";
const port = 3000;

dal.connect();

import 'dotenv/config'
import authController from './src/controllers/auth-controller.js'
import vacationController from './src/controllers/vacation-controller.js'
import bookingController from './src/controllers/booking-controller.js'
import reviewController from './src/controllers/review-controller.js'
import numOfBooking from './src/controllers/booked-number-controller.js'
import bookedPerMonth from './src/controllers/Booked-per-month-controller.js'
import companyRoutes from './src/controllers/companies-controller.js'; 
import categoryRouts from './src/controllers/category-controller.js';
import apiKeysRoutes from './src/controllers/apiKey-controller.js'; 
import imageController from './src/controllers/image-controller.js';
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from 'url';
import multer from 'multer';
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

const app = express();

app.use(cors());
app.use(express.json())
app.use("/api", authController);
app.use("/api", vacationController);
app.use("/api", bookingController);
app.use("/api", reviewController);
app.use("/api", numOfBooking);
app.use("/api", bookedPerMonth);
app.use("/api",categoryRouts);
app.use("/api", companyRoutes);
app.use("/api", apiKeysRoutes);
app.use("/api", imageController); 
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "Front-End")));
app.use('/assets', express.static(path.join(__dirname, 'assets'))); 


app.get('/', (req, res) => {
  res.send('Welcome to my server!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});