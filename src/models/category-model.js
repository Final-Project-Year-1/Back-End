import mongoose, { Schema } from "mongoose";

const CategorySchema = new Schema({
    category: {
        type: String,
        required: true
    },
}, {
    versionKey: false
});

const CategoryModel = mongoose.model("Category", CategorySchema, "trip-category");
export default CategoryModel;