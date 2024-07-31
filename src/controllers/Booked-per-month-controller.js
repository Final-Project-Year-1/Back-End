import express from 'express';
import logic from '../logic/booked-per-month-logic.js'; 
import ErrorModel from '../models/error-model.js';
import verifyAdmin from '../middleware/verify-admin.js';

const router = express.Router();

// verifyAdmin,
router.get('/bookings-by-month', async (req, res) => {
    try {
        const result = await logic.getBookingsByCompanyByMonth();
        res.json(result);
    } catch (err) {
        if (err instanceof ErrorModel) {
            res.status(err.status).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

// verifyAdmin,
router.get('/bookings-by-company-by-month/:companyId', async (req, res) => {
    try {
        const result = await logic.getBookingsByMonthForCompany(req.params.companyId);
        res.json(result);
    } catch (err) {
        if (err instanceof ErrorModel) {
            res.status(err.status).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

router.get('/total-bookings-by-month/:month', verifyAdmin, async (req, res) => {
    try {
        const result = await logic.getTotalBookingsByMonth(req.params.month);
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
