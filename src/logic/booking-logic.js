import BookingModel from "../models/booking-model.js";
import ErrorModel from "../models/error-model.js";
import VacationModel from "../models/vacation-model.js";

async function createBooking(booking) {
    const errors = booking.validateSync();
    if (errors) throw new ErrorModel(400, errors.message);
    return booking.save();
}
async function getAllBookings() {
    return BookingModel.find()
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

async function deleteBooking(bookingId) {
    const deletedBooking = await BookingModel.findByIdAndDelete(bookingId).exec();
    if (!deletedBooking) throw new ErrorModel(404, `Booking with id ${bookingId} not found`);
    return deletedBooking;
}

async function updateBooking(bookingId, bookingData) {
    const updatedBooking = await BookingModel.findByIdAndUpdate(bookingId, bookingData, { new: true, runValidators: true }).exec();
    if (!updatedBooking) throw new ErrorModel(404, `Booking with id ${bookingId} not found`);
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
async function getBookingById(bookingId) {
    return BookingModel.findById(bookingId)
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

export default {
    createBooking,
    getAllBookings,
    deleteBooking,
    updateBooking,
    getBookingByUserId,
    getBookingById,
    getBookingByVacationId,
};
