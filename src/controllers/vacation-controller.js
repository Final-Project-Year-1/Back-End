
import express from "express";
import verifyAdmin from '../middleware/verify-admin.js';
import verifyLoggedIn from '../middleware/verify-logged-in.js';
import logic from '../logic/vacation-logic.js';
import VacationModel from "../models/vacation-model.js";
import path from 'path';
import { fileURLToPath } from 'url';
import ErrorModel from "../models/error-model.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get("/Allvacations",async (request, response) => {
    try {
        const vacations = await logic.getAllVacations();
        response.json(vacations);
    }
    catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

router.get("/vacations/:_id", async (request, response) => {
    try {
        const _id = request.params._id;
        const vacation = await logic.getOneVacation(_id);
        response.json(vacation);
    }
    catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

router.put("/vacations/:_id", async (request, response) => {
    try {
        const vacationId = request.params._id;
        const vacationData = request.body;
        vacationData.image = request.files?.image;
        
        const updatedVacation = await logic.updateVacation(vacationId, vacationData);
        response.json(updatedVacation);
    }
    catch (err) {
        console.log(err);
        response.status(err.status || 400).json(err);
    }
});

router.post("/vacations", async (request, response) => {
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

router.delete("/vacations/:_id", async (request, response) => {
    try {
        const deletedVacation = await logic.deleteVacation(request.params._id);
        response.json(deletedVacation);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

router.get("/vacations/images/:imageName" ,async (request, response) => {
    try {
        const imageName = request.params.imageName;
        const absolutePath = path.join(__dirname, "..", "assets", "images", "vacations", imageName);
        response.sendFile(absolutePath);
    }
    catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

//what is it doing? gets the sum of vacations
router.get("/vacation/total-vacations", async (req, res) => {
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

router.get('/vacation/vacations-per-company/:companyId', async (req, res) => {
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

router.get('/vacation/spots-left', async (req, res) => {
    try {
        const vacationId = req.body.vacationId;
        const passengers = req.body.vacationId
        
        const result = await logic.getVacationSpotsLeft(vacationId, passengers);
        if (result) {
            res.status.apply(200).send('ok');
            return
        }
        res.status(400).send('bad request');
    } catch (err) {
        if (err instanceof ErrorModel) {
            res.status(err.status).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
})

router.get('/top-vacations', async (req, res) => {
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
router.get('/vacation-images', async (req, res) => {
    try {
        const result = await logic.getAllVacationImages();
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).send({ message: err.message || "Internal server error" });
    }
});

router.get('/vacations-by-company', async (req, res) => {
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
        const countries = await logic.getAllDestinations();
        res.json(countries);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
});

export default router;
