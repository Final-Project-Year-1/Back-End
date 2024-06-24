import express from "express";
import logic from '../logic/vacation-logic.js';
import VacationModel from "../models/vacation-model.js";

const router = express.Router();

router.post("/vacations", async (request, response) => {
    try{
        const vacation = new VacationModel(request.body);
        const addedVacation = await logic.createVacation(vacation);
        response.status(201).json(addedVacation);
    }
    catch(err)
    {
            console.log(err);
            response.json(err);
    }
});
router.get("/vacations", async (request, response) =>{
    try{
        const vacations = await logic.getAllVacations();
        response.json(vacations);
    }
    catch(err)
    {
        console.log(err);
        response.status(400).json(err);
    }
});

export default router;