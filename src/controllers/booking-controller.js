import express from "express";
import logic from '../logic/booking-logic.js';
import BookingModel from "../models/booking-model.js";

const router = express.Router();

router.post("/bookings", async (request, response) => {
    try {
        const booking = new BookingModel(request.body);
        const addedBooking = await logic.createBooking(booking);
        response.status(201).json(addedBooking);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});


router.get("/bookings", async (request, response) => {
    try {
        const data = await logic.getAllBookings();
        response.json(data);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});
router.delete("/bookings/:_id", async (request, response) => {
    try {
        const deletedBooking = await logic.deleteBooking(request.params._id);
        response.json(deletedBooking);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

router.put("/bookings/:_id", async (request, response) => {
    try {
        const updatedBooking = await logic.updateBooking(request.params._id, request.body);
        response.json(updatedBooking);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

router.get("/bookings/:userId", async (request, response) => {
    try {
        const booking = await logic.getBookingByUserId(request.params.userId);
        response.json(booking);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

router.get("/bookings//:vacationId", async (request, response) => {
    try {
        const book = await logic.getBookingByVacationId(request.params.vacationId);
        response.json(book);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

router.get("/bookings/:id", async (request, response) => {
    try {
        const booking = await logic.getBookingByBookingId(request.params.id);
        response.json(booking);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

export default router;