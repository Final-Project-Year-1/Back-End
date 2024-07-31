import CategoryModel from "../models/category-model.js"; // שים לב לשנות את שם המודול
import ErrorModel from "../models/error-model.js";

async function getTotalCategories() {
    try {
        const totalCategories = await CategoryModel.countDocuments({ category: { $ne: "Cancelled" } });
        return { totalCategories };
    } catch (err) {
        throw new ErrorModel(500, err.message || "Internal server error");
    }
}
async function createCategory(category) {
    try {
        const existingCategory = await CategoryModel.findOne({ 
            category: { $regex: new RegExp(`^${category.category}$`, 'i') } 
        });

        if (existingCategory) {
            throw new ErrorModel(400, `Category with name ${category.category} already exists`);
        }
        await category.save();

        return category;
    } catch (err) {
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}
async function findCategoryById(_id) {
    try {
        const category = await CategoryModel.findById(_id).exec();
        if (!category) throw new ErrorModel(404, `Category with _id ${_id} not found`);
        return category;
    } catch (err) {
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}

async function updateCategoryName(categoryId, categoryData) {
    try {
        const existingCategory = await CategoryModel.findOne({
            _id: { $ne: categoryId },
            category: { $regex: new RegExp(`^${categoryData.category}$`, 'i') }
        }).exec();

        if (existingCategory) {
            throw new ErrorModel(400, `Category name ${categoryData.category} already exists`);
        }

        const updatedCategory = await CategoryModel.findByIdAndUpdate(categoryId, categoryData, { new: true, runValidators: true }).exec();
        if (!updatedCategory) {
            throw new ErrorModel(404, `Category with id ${categoryId} not found`);
        }
        return updatedCategory;
    } catch (err) {
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}

async function getAllCategories() {
    try {
        const categories = await CategoryModel.find({ category: { $ne: "Cancelled" } }, { _id: 1, category: 1 }).exec();
        return categories;
    } catch (err) {
        throw new ErrorModel(500, err.message || "Internal server error");
    }
}

async function deleteCategory(categoryId) {
    try {
        const deletedCategory = await CategoryModel.findByIdAndDelete(categoryId).exec();
        if (!deletedCategory) throw new ErrorModel(404, `Category with id ${categoryId} not found`);
        return { message: "Category deleted successfully" };
    } catch (err) {
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}

export default {
    getTotalCategories,
    getAllCategories,
    updateCategoryName,
    deleteCategory,
    findCategoryById,
    createCategory,
};
