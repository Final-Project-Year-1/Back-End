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

router.get("/auth/users/:id", async (request, response) => {
    try {
        const user = await logic.findUserById(request.params.id);
        response.json(user);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

router.delete("/auth/users/delete/:id", async (request, response) => {
    try {
        const deletedUser = await logic.deleteUser(request.params.id);
        response.json(deletedUser);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

router.get("/auth/users", async (request, response) => {
    try {
        const data = await logic.getAllUsers();
        response.json(data);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});


router.get('/auth/user-count', async (req, res) => {
    try {
        const result = await logic.getUserCount();
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