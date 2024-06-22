import express from "express";
import logic from '../logic/auth-logic.js';
import UserModel from "../models/user-model.js";
import CredentialsModel from "../models/credentials-model.js";

const router = express.Router();

router.post("/auth/register", async (request, response) => {
    try {
        const user = new UserModel(request.body);
        const token = await logic.register(user);
        response.status(201).json(token);
    }
    catch (err) {
        console.log(err);
        response.json(err);
    }
});

router.post("/auth/login", async (request, response) => {
    try {
        const credentials = new CredentialsModel(request.body);
        const token = await logic.login(credentials);
        response.json(token);
    }
    catch (err) {
        console.log(err);
        response.json(err);
    }
});

export default router;