import mongoose, { Schema } from "mongoose";
import VacationModel from "./vacation-model.js";
import UserModel from "./user-model.js";
const ReviewSchema = new Schema({
  vacationId: {
    type: Schema.Types.ObjectId,
    ref: "VacationModel",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  reviewDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
},{
    versionKey: false,
    toJSON: { virtuals: true }, 
    id: false 
});

ReviewSchema.virtual("user", {
    ref: "UserModel",
    localField: "userId",
    foreignField: "_id",
    justOne: true
});

ReviewSchema.virtual("vacation", {
    ref: "VacationModel",
    localField: "vacationId",
    foreignField: "_id",
    justOne: true
});

const ReviewModel = mongoose.model("ReviewModel", ReviewSchema, "reviews");

export default ReviewModel;