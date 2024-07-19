import BookingModel from "../models/booking-model.js";
import ErrorModel from "../models/error-model.js";
import vacationLogic from "./vacation-logic.js";

// async function createBooking(booking) {
//     const errors = booking.validateSync();
//     if (errors) throw new ErrorModel(400, errors.message);
//     return booking.save();
// }

async function createBooking(booking) {
    const errors = booking.validateSync();
    if (errors) throw new ErrorModel(400, errors.message);

    const savedBooking = await booking.save();

    await vacationLogic.updateVacationSpots(booking.vacationId, booking.Passengers);

    return savedBooking;
}
async function getAllBookings() {
    return BookingModel.find()
        .populate({
            path: 'vacationId',
            populate: [
                { path: 'companyName', model: 'CompanyModel'},
                { path: 'tripCategory', model: 'CategoryModel' }
            ]
        })
        .populate({
            path: 'userId',
            select: 'firstName lastName email'
        })
        .exec();
}

async function deleteBooking(bookingId) {
    const deletedBooking = await BookingModel.findByIdAndDelete(bookingId).exec();
    if (!deletedBooking) throw new ErrorModel(404, `Booking with id ${bookingId} not found`);
    await vacationLogic.updateVacationSpots(deletedBooking.vacationId, (-1)*deletedBooking.Passengers);
    return deletedBooking;
}

// async function updateBooking(bookingId, bookingData) {
//     const updatedBooking = await BookingModel.findByIdAndUpdate(bookingId, bookingData, { new: true, runValidators: true }).exec();
//     if (!updatedBooking) throw new ErrorModel(404, `Booking with id ${bookingId} not found`);
//     newPassengers = bookingData.Passengers
//     oldPassengers = 
//     await vacationLogic.updateVacationSpots(updatedBooking.vacationId, (-1)*updatedBooking.Passengers);
//     return updatedBooking;
// }

async function updateBooking(bookingId, bookingData) {
    const oldBooking = await BookingModel.findById(bookingId).exec();
    if (!oldBooking) throw new ErrorModel(404, `Booking with id ${bookingId} not found`);

    const oldPassengers = oldBooking.Passengers;
    const newPassengers = bookingData.Passengers;

    const updatedBooking = await BookingModel.findByIdAndUpdate(bookingId, bookingData, { new: true, runValidators: true }).exec();
    if (!updatedBooking) throw new ErrorModel(404, `Booking with id ${bookingId} not found`);

    const passengerDifference = newPassengers - oldPassengers;

    await vacationLogic.updateVacationSpots(updatedBooking.vacationId, passengerDifference);

    return updatedBooking;
}

async function getBookingByUserId(userId) {
    return BookingModel.find({userId})
        .populate({
            path: 'vacationId',
            populate: [
                { path: 'companyName', model: 'CompanyModel' },
                { path: 'tripCategory', model: 'CategoryModel' }
            ]
        })
        .populate('userId')
        .exec();
}

async function getBookingByVacationId(vacationId) {
    return BookingModel.find({vacationId})
    .populate({
        path: 'vacationId',
        populate: [
            { path: 'companyName', model: 'CompanyModel' },
            { path: 'tripCategory', model: 'CategoryModel' }
        ]
    })
    .populate('userId')
    .exec();
}

async function findOneBooking(_id) {
  const vacation = await BookingModel.findById(_id)
    .populate({
      path: "vacationId",
      populate: [
        { path: "companyName", model: "CompanyModel" },
        { path: "tripCategory", model: "CategoryModel" },
      ],
    })
    .exec();
  if (!vacation) throw new ErrorModel(404, `_id ${_id} not found`);
  return vacation;
}

export default {
    createBooking,
    getAllBookings,
    deleteBooking,
    updateBooking,
    getBookingByUserId,
    findOneBooking,
    getBookingByVacationId,
};
