import mongoose, { Schema } from "mongoose";
import VacationModel from "./vacation-model.js";
import UserModel from "./user-model.js";

const BookingSchema = new Schema({
    vacationId: {
        type: Schema.Types.ObjectId,
        ref: "VacationModel",
        required: true
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: "UserModel",
        required: true
      },
    //   companyName:{
    //     type: Schema.Types.ObjectId,
    //     ref: "CompanyModel"
    // },
      bookingDate: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending',
        required: true
      }
},{
    versionKey: false,
    toJSON: { virtuals: true }, 
    id: false 
});

BookingSchema.virtual("user", {
    ref: "UserModel",
    localField: "userId",
    foreignField: "_id",
    justOne: true
});

// BookingSchema.virtual("company", {
//   ref: "CompanyModel", 
//   localField: "companyName",
//   foreignField: "_id",
//   justOne: true
// });

BookingSchema.virtual("vacation", {
    ref: "VacationModel",
    localField: "vacationId",
    foreignField: "_id",
    justOne: true
});

const BookingModel = mongoose.model("BookingModel", BookingSchema, "bookings");

export default BookingModel;