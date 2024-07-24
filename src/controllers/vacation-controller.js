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

router.get("/vacations/images/:imageName", verifyLoggedIn,async (request, response) => {
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

router.get('/top-rated-vacations', async (req, res) => {
    try {
        const topVacations = await logic.getTopRatedVacations();
        res.json(topVacations);
    } catch (err) {
        console.error("Error in GET /top-rated-vacations:", err);
        if (err instanceof ErrorModel) {
            res.status(err.status).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

// נתיב לחיפוש חופשות לפי מספר נוסעים, חודש יציאה, חודש חזרה ויעד
router.get('/search-vacations',  async (req, res) => {
    const groupOf = req.body.numOfPassengers
    const month = req.body.departureMonth
    const dest = req.body.destination
    
    try {
        if (!groupOf) {
            throw new ErrorModel(400, 'All parameters are required: numOfPassengers, departureMonth, destination');
        }

        const passengers = parseInt(groupOf, 10);
        if (isNaN(passengers)) {
            console.log("numOfPassengers is not a number:", numOfPassengers);
            throw new ErrorModel(400, 'numOfPassengers must be a number');
        }

        const result = await logic.searchQuery(groupOf, month, dest);

        res.json(result);
    } catch (err) {
        console.error("Error in GET /search-vacations:", err);
        if (err instanceof ErrorModel) {
            res.status(err.status).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});


router.get('/search-vacations-query2', async (req, res) => {
    const groupOf = req.body.numOfPassengers
    const company = req.body.companyId
    const rating = req.body.minRating
    const month = req.body.departureMonth
    console.log("------------------")
    console.log(company, rating,groupOf,month)
    try {

        if (!company || !rating || !groupOf) {
            throw new ErrorModel(400, 'All parameters are required: companyId, minRating, numOfPassengers');
        }

        const passengers = parseInt(groupOf, 10);
        const rate = parseInt(rating, 10);

        if (isNaN(passengers)) {
            console.log("numOfPassengers is not a number:", passengers);
            throw new ErrorModel(400, 'numOfPassengers must be a number');
        }
        if (isNaN(rate)) {
            console.log("minRating is not a number:", rate);
            throw new ErrorModel(400, 'minRating must be a number');
        }
        const result = await logic.searchVacationsByCriteria(company,rating,groupOf,month);

        res.json(result);
    } catch (err) {
        console.error("Error in GET /search-vacations-query2:", err);
        if (err instanceof ErrorModel) {
            res.status(err.status).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});
router.get('/vacations/destinations/countries', async (req, res) => {
    try {
        console.log("Request received for /vacations/destinations");
        const countries = await logic.getAllDestinations();
        console.log("Sending response with destinations:", countries);
        res.json(countries);
    } catch (err) {
        console.error("Error in /vacations/destinations:", err);
        res.status(err.status || 500).json({ message: err.message });
    }
});

export default router;
