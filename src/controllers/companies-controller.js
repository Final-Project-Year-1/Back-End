import express from 'express';
import logic from '../logic/companies-logic.js'; 
import ErrorModel from '../models/error-model.js';
import verifyLoggedIn from '../middleware/verify-logged-in.js';
import verifyAdmin from '../middleware/verify-admin.js';
import CompanyModel from '../models/company-model.js';
const router = express.Router();

router.get('/total-companies',verifyAdmin, async (req, res) => {
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

router.get('/all-companies',async (req, res) => {
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
router.post("/addCompany", verifyAdmin, async (request, response) => {
    try {
        const company = new CompanyModel(request.body);
        const addedCompany = await logic.createCompany(company);
        response.status(201).json(addedCompany);
    } catch (err) {
        response.status(400).json(err);
    }
});
router.get("/findCompany/:_id", async (request, response) => {
    try {
        const _id = request.params._id;
        const company = await logic.findCompanyById(_id);
        response.status(200).json(company);
    }
    catch (err) {
        response.status(400).json(err);
    }
});
router.put("/updateCompany/:id", verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCompany = await logic.updateCompanyName(id, req.body);
        res.status(200).json(updatedCompany);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
router.delete("/deleteCompany/:id", verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await logic.deleteCompany(id);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
