import express from "express";
import dal from "./src/dal.js";
import authController from './src/controllers/auth-controller.js';
import vacationController from './src/controllers/vacation-controller.js';
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = 3000;
const app = express();

dal.connect();

app.use(fileUpload({
  createParentPath: true
}));

app.use(express.json())

app.use(express.static(path.join(__dirname, "frontend")));

app.use("/api", authController);
app.use("/api", vacationController);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});