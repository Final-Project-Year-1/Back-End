import express from "express";
import dal from "./src/dal.js";
const port = 3000;

dal.connect();

import authController from './src/controllers/auth-controller.js'
import vacationController from './src/controllers/vacation-controller.js'
import bookingController from './src/controllers/booking-controller.js'
import reviewController from './src/controllers/review-controller.js'
import numOfVacations from './src/controllers/vacations-number-logic.js'
import numOfBooking from './src/controllers/booked-number-controller.js'
import bookedPerMonth from './src/controllers/Booked-per-month-controller.js'
const app = express();

app.use(express.json())
app.use("/api", authController);
app.use("/api", vacationController);
app.use("/api", bookingController);
app.use("/api", reviewController);
app.use("/api", numOfVacations);
app.use("/api", numOfBooking);
app.use("/api", bookedPerMonth);
app.get('/', (req, res) => {
  res.send('Welcome to my server!');
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});