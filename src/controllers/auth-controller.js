import express from "express";
import logic from '../logic/auth-logic.js';
import UserModel from "../models/user-model.js";
import CredentialsModel from "../models/credentials-model.js";
import verifyAdmin from "../middleware/verify-admin.js";
import verifyLoggedIn from "../middleware/verify-logged-in.js";

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

router.get("/auth/users/:id",verifyAdmin, async (request, response) => {
    try {
        const user = await logic.findUserById(request.params.id);
        response.json(user);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

router.get("/auth/users/searchByEmail/:email", verifyAdmin, async (request, response) => {
    try {
        const user = await logic.findUserByEmail(request.params.email);
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }
        response.json(user);
    } catch (err) {
        console.error("Error in finding user by email:", err);
        response.status(400).json({ message: err.message });
    }
});

router.get("/auth/users",verifyAdmin, async (request, response) => {
    try {
        const data = await logic.getAllUsers();
        response.json(data);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

router.put("/auth/users/updateUser/:id", verifyAdmin, async (request, response) => {
    try {
        const updatedUser = await logic.updateUser(request.params.id, request.body);
        response.json(updatedUser);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});
router.get('/auth/user-count',verifyAdmin, async (req, res) => {
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