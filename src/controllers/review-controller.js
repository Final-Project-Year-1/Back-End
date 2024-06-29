import express from "express";
import logic from '../logic/review-logic.js';
import ReviewModel from "../models/review-model.js";
import verifyLoggedIn from "../middleware/verify-logged-in.js";
import verifyAdmin from "../middleware/verify-admin.js";

const router = express.Router();

router.post("/vacation/reviews", verifyLoggedIn, async (request, response) => {
    try {
        const review = new ReviewModel(request.body);
        const addedReview = await logic.createReview(review);
        response.status(201).json(addedReview);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

router.get("/vacation/reviews", async (request, response) => {
    try {
        const reviews = await logic.getAllReviews();
        response.json(reviews);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

router.delete("/vacation/reviews/:id", verifyLoggedIn, async (request, response) => {
    try {
        const deletedReview = await logic.deleteReview(request.params.id);
        response.json(deletedReview);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

router.get("/users/reviews/:userId", verifyAdmin, async (request, response) => {
    try {
        const reviews = await logic.getReviewsByUserId(request.params.userId);
        response.json(reviews);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

router.put("/vacation/reviews/:id", verifyLoggedIn, async (request, response) => {
    try {
        const updatedReview = await logic.updateReview(request.params.id, request.body);
        response.json(updatedReview);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

//???
router.get("/vacation/reviews/:id", async (request, response) => {
    try {
        const reviews = await logic.getReviewByVacationId(request.params.id);
        response.json(reviews);
    } catch (err) {
        console.log(err);
        response.status(400).json(err);
    }
});

export default router;
