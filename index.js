import express from "express";
import dal from "./src/dal.js";
const port = 3000;

dal.connect();

import authController from './src/controllers/auth-controller.js'
import vacationController from './src/controllers/vacation-controller.js'
const app = express();

app.use(express.json())
app.use("/api", authController);
app.use("/api", vacationController);
app.get('/', (req, res) => {
    res.send('Welcome to my server!');
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});