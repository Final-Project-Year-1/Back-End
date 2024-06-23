import mongoose, { Schema } from "mongoose";
import VacationModel from "./vacation-model";

const BookingSchema = new Schema({
    vacationId: {
        type: Schema.Types.ObjectId,
        required: true
      },
      userId: {
        type: Schema.Types.ObjectId,
        required: true
      },
      bookingDate: {
        type: Date,
        default: Date.now,
        required: true
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
    ref: UserModel,
    localField: "userId",
    foreignField: "_id",
    justOne: true
});

BookingSchema.virtual("vacation", {
    ref: VacationModel,
    localField: "vacationId",
    foreignField: "_id",
    justOne: true
});

const BookingModel = mongoose.model("BookingModel", BookingSchema, "bookings");

export default BookingModel;