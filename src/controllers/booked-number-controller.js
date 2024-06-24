import express from 'express';
import logic from '../logic/booked-number-logic.js'; 
import ErrorModel from '../models/error-model.js';

const router = express.Router();

router.get('/top-booked-company', async (req, res) => {
    try {
        const result = await logic.getTopBookedCompany();
        res.json(result);
    } catch (err) {
        if (err instanceof ErrorModel) {
            res.status(err.status).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

router.get('/bookings-by-company', async (req, res) => {
    try {
        const result = await logic.getBookingsByCompany();
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
