import express from "express";
import logic from '../logic/vacation-logic.js';
import VacationModel from "../models/vacation-model.js";
import path from 'path';
import { fileURLToPath } from 'url';
import verifyLoggedIn from "../middleware/verify-logged-in.js";
import verifyAdmin from "../middleware/verify-admin.js";
import ErrorModel from "../models/error-model.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get("/vacations", async (request, response) => {
    try {
        const vacations = await logic.getAllVacations();
        response.json(vacations);
    }
    catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

router.get("/vacations/:_id", verifyLoggedIn, async (request, response) => {
    try {
        const _id = request.params._id;
        const vacation = await logic.getOneVacation(_id);
        response.json(vacation);
    }
    catch (err) {
        console.log(err);
    }
});

router.put("/vacations/:_id", verifyAdmin , async (request, response) => {
    try {
        request.body._id = request.params._id;
        request.body.image = request.files?.image;
        const vacation = new VacationModel(request.body);
        const updatedVacation = await logic.updateVacation(vacation);
        response.json(updatedVacation);
    }
    catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

router.post("/vacations", verifyAdmin, async (request, response) => {
    try {
        request.body.image = request.files?.image;
        const vacation = new VacationModel(request.body);
        const addedVacation = await logic.createVacation(vacation);
        response.status(201).json(addedVacation);
    }
    catch (err) {
        console.log(err);
        response.json(err);
    }
});

router.delete("/vacations/:_id", verifyAdmin, async (request, response) => {
    try {
        const _id = request.params._id;
        await logic.deleteVacation(_id);
        response.json(_id).sendStatus(204);
    }
    catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

router.get("/vacations/images/:imageName",async (request, response) => {
    try {
        const imageName = request.params.imageName;
        const absolutePath = path.join(__dirname, "..", "assets", "images", "vacations", imageName);
        response.sendFile(absolutePath);
    }
    catch (err) {
        console.log(err);
    }
});

//what is it doing? gets the sum of vacations
router.get("/vacation/total-vacations", verifyAdmin, async (req, res) => {
    try {
        const result = await logic.getTotalVacations();
        res.json(result);
    } catch (err) {
        if (err instanceof ErrorModel) {
            res.status(err.status).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

router.get('/vacation/vacations-per-company/:companyId',verifyLoggedIn, async (req, res) => {
    try {
        const result = await logic.getTotalVacationsByCompany(req.params.companyId);
        res.json(result);
    } catch (err) {
        if (err instanceof ErrorModel) {
            res.status(err.status).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

router.get('/top-vacations',verifyLoggedIn, async (req, res) => {
    try {
        const result = await logic.getTopVacations();
        res.json(result);
    } catch (err) {
        if (err instanceof ErrorModel) {
            res.status(err.status).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

router.get('/vacations-by-company',verifyLoggedIn, async (req, res) => {
    try {
        const result = await logic.getVacationsByCompany();
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
