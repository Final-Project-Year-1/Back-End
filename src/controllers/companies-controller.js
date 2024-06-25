import express from 'express';
import logic from '../logic/companies-logic.js'; 
import ErrorModel from '../models/error-model.js';

const router = express.Router();

router.get('/total-companies', async (req, res) => {
    try {
        const result = await logic.getTotalCompanies();
        res.json(result);
    } catch (err) {
        if (err instanceof ErrorModel) {
            res.status(err.status).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

router.get('/all-companies', async (req, res) => {
    try {
        const companies = await logic.getAllCompanies();
        res.json(companies);
    } catch (err) {
        if (err instanceof ErrorModel) {
            res.status(err.status).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

export default router;
