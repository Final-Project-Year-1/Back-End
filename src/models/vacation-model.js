import mongoose, { Schema } from "mongoose";
import CompanyModel from "./company-model.js";
import CategoryModel from "./category-model.js";

const VacationSchema = new Schema({
    destination: {
        type: String,
        required: [true, "Missing destination"],
        minlength: [2, "destination name is too short"],
        maxlength: [20, "destination name is too long"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Missing description"],
        minlength: [2, "description name is too short"],
        maxlength: [1000, "description name is too long"],
        trim: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    price: {
        type: Number,
        required: [true, "Missing price"],
        min: [0, "Price can't be negative"],
        max: [50000, "Price can't exceed 50000"]
    },
    groupOf: {
        type: Number,
        required: [true, "Missing group number"],
        min: [1, "group number can't be negative"],
        max: [100, "group number can't exceed 50000"]
    },
    vacationType: {
        type: String,
        enum: ['All-Inclusive', 'Bed and Breakfast', 'Full Board', 'Half Board', 'Cancelled'],
        required: true
    },
    companyName: {
        type: Schema.Types.ObjectId,
        ref: "CompanyModel"
    },
    tripCategory: {
        type: Schema.Types.ObjectId,
        ref: "CategoryModel"
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 10,
    },
    spotsTaken: {
        type: Number,
        default: 0,
    },
    spotsLeft: {
        type: Number,
    },
    image: {
        type: Object,
    },
    imageName: {
        type: String,
        required: true,
    },
}, {
    versionKey: false,
    toJSON: { virtuals: true },
    id: false
});

VacationSchema.virtual("company", {
    ref: "CompanyModel",
    localField: "companyName",
    foreignField: "_id",
    justOne: true
});

VacationSchema.virtual("category", {
    ref: "CategoryModel",
    localField: "tripCategory",
    foreignField: "_id",
    justOne: true
});

const VacationModel = mongoose.model("VacationModel", VacationSchema, "vacations");

export default VacationModel;