import express from "express";
import logic from '../logic/vacation-logic.js';
import VacationModel from "../models/vacation-model.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

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

router.get("/vacations/:_id", async (request, response) =>{
    try {
        const _id = request.params._id;
        const vacation = await logic.getOneVacation(_id);
        response.json(vacation);
    }
    catch (err) {
        console.log(err);
    }
});

router.put("/vacations/:_id" , async (request, response) => {
    try {
        request.body._id = request.params._id;
        request.body.image = request.files?.image;
        const vacation = new VacationModel(request.body);
        const updatedVacation = await logic.updateVacation(vacation);
        response.json(updatedVacation);
    }
    catch (err) {
        console.log(err);
    }
});

router.post("/vacations", async (request, response) => {
    try{
        request.body.image = request.files?.image; // Correctly assign image file
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

router.delete("/vacations/:_id" , async (request, response) => {
    try {
        const _id = request.params._id;
        await logic.deleteVacation(_id);    
        response.sendStatus(204);
    }
    catch (err) {
        console.log(err);
    }
});

//doesnt work
router.get("/vacations/images/:imageName", async (request, response) => {
    try {
        const imageName = request.params.imageName;
        const absolutePath = path.join(__dirname, "..", "assets", "images", "vacations", imageName);
        response.sendFile(absolutePath);
    }
    catch (err) {
        console.log(err);
    }
});

export default router;