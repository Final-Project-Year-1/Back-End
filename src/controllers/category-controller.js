import express from 'express';
import verifyLoggedIn from '../middleware/verify-logged-in.js';
import verifyAdmin from '../middleware/verify-admin.js';
import categoryLogic from '../logic/category-logic.js'; 
import CategoryModel from '../models/category-model.js';


const router = express.Router();

router.post("/addCategory", verifyAdmin, async (request, response) => {
    try {
        const category = new CategoryModel(request.body);
        const addedCategory = await categoryLogic.createCategory(category);
        response.status(201).json(addedCategory);
    } catch (err) {
        response.status(400).json(err);
    }
});
router.put('/updateCategory/:id', verifyAdmin, async (req, res) => {
    try {
        const updatedCategory = await categoryLogic.updateCategoryName(req.params.id, req.body);
        res.send(updatedCategory);
    } catch (err) {
        res.status(err.status || 500).send({ message: err.message });
    }
});

router.delete('/deleteCategory/:id', verifyAdmin, async (req, res) => {
    try {
        const result = await categoryLogic.deleteCategory(req.params.id);
        res.send(result);
    } catch (err) {
        res.status(err.status || 500).send({ message: err.message });
    }
});

router.get('/allCategories', async (req, res) => {
    try {
        const categories = await categoryLogic.getAllCategories();
        res.json(categories);
    } catch (err) {
        res.status(err.status || 500).send({ message: err.message });
    }
});

// קבלת ספירת כל הקטגוריות
router.get('/total-categories', verifyAdmin, async (req, res) => {
    try {
        const result = await categoryLogic.getTotalCategories();
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).send({ message: err.message });
    }
});


router.get('/find-category/:_id', async (req, res) => {
    try {
        const category = await categoryLogic.findCategoryById(req.params._id);
        res.status(200).json(category);
    } catch (err) {
        res.status(err.status || 500).send({ message: err.message });
    }
});

export default router;
