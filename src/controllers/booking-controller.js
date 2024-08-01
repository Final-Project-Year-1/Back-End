import express from "express";
import logic from '../logic/booking-logic.js';
import BookingModel from "../models/booking-model.js";
import verifyAdmin from "../middleware/verify-admin.js";
import verifyLoggedIn from "../middleware/verify-logged-in.js";
import ErrorModel from "../models/error-model.js";


const router = express.Router();

router.post("/newbooking", verifyLoggedIn, async (request, response) => {
    try {
        const booking = new BookingModel(request.body);
        const addedBooking = await logic.createBooking(booking);
        response.status(201).json(addedBooking);
    } catch (err) {
        response.status(400).json(err);
    }
});
router.delete('/bookings/order/:orderNumber', verifyLoggedIn, async (request, response) => {
    try {
        const orderNumber = request.params.orderNumber;
        const deletedBooking = await logic.deleteBookingByOrderNumber(orderNumber);
        response.json(deletedBooking);
    } catch (err) {
        response.status(err.status || 500).json({ message: err.message });
    }
});

router.put('/bookings/order/:orderNumber', verifyLoggedIn, async (request, response) => {
    try {
        const orderNumber = request.params.orderNumber;
        const bookingData = request.body;
        const updatedBooking = await logic.updateBookingByOrderNumber(orderNumber, bookingData);
        response.json(updatedBooking);
    } catch (err) {
        response.status(err.status || 500).json({ message: err.message });
    }
});

router.get('/bookings/order/:orderNumber', async (request, response) => {
    try {
        const orderNumber = request.params.orderNumber;
        const booking = await logic.getBookingByOrderNumber(orderNumber);
        if (!booking) {
            return response.status(404).json({ message: 'Booking not found' });
        }
        response.json(booking);
    } catch (err) {
        response.status(500).json({ message: 'Internal Server Error' });
    }
});
router.get("/bookings", verifyAdmin, async (request, response) => {
    try {
        const data = await logic.getAllBookings();
        response.json(data);
    } catch (err) {
        response.status(400).json(err);
    }
});

router.delete("/bookings/:_id", verifyAdmin, async (request, response) => {
    try {
        const deletedBooking = await logic.deleteBooking(request.params._id);
        response.json(deletedBooking);
    } catch (err) {
        response.status(400).json(err);
    }
});

router.put("/bookings/:_id",verifyAdmin, async (request, response) => {
    try {
        const updatedBooking = await logic.updateBooking(request.params._id, request.body);
        response.json(updatedBooking);
    } catch (err) {
        response.status(400).json(err);
    }
});

router.get("/bookings/:_id", verifyAdmin, async (request, response) => {
    try {
        const booking = await logic.findOneBooking(request.params._id);
        response.json(booking);
    } catch (err) {
        response.status(400).json(err);
    }
});

router.get("/bookings/bookings-by-user/:userId", async (request, response) => {
    try {
        const booking = await logic.getBookingByUserId(request.params.userId);
        response.json(booking);
    } catch (err) {
        response.status(400).json(err);
    }
});

router.get("/bookings/bookings-by-vacation/:vacationId", verifyAdmin, async (request, response) => {
    try {
        const book = await logic.getBookingByVacationId(request.params.vacationId);
        response.json(book);
    } catch (err) {
        response.status(400).json(err);
    }
});

router.post('/user-booking-query', verifyAdmin, async (req, res) => {
    const { email, departureMonth, destination } = req.body;
    try {
        if (!destination || !departureMonth || !email) {
            console.error('Missing parameters');
            throw new ErrorModel(400, 'All parameters are required: Email, Destination, departureMonth');
        }

        const emailTrimmed = email.trim().toLowerCase();
        const destTrimmed = destination.trim().toLowerCase();
        const month = parseInt(departureMonth, 10);

        if (isNaN(month)) {
            throw new ErrorModel(400, 'departure Month must be a number');
        }

        const result = await logic.searchQuery(emailTrimmed, destTrimmed, month);
        res.json(result);
    } catch (err) {
        if (err instanceof ErrorModel) {
            res.status(err.status).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});


export default router;