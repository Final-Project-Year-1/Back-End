import BookingModel from "../models/booking-model.js";
import ErrorModel from "../models/error-model.js";
import vacationLogic from "./vacation-logic.js";
import UserModel from "../models/user-model.js"

async function createBooking(booking) {
    const errors = booking.validateSync();
    if (errors) throw new ErrorModel(400, errors.message);

    const vacation = await vacationLogic.getOneVacation(booking.vacationId);
    if (!vacation) throw new ErrorModel(404, `Vacation with id ${booking.vacationId} not found`);

    if (booking.Passengers > vacation.spotsLeft) {
        throw new ErrorModel(400, `Not enough spots left for the requested number of passengers`);
    }

    booking.OrderNumber = await generateNextOrderNumber();
    const savedBooking = await booking.save();

    await vacationLogic.updateVacationSpots(booking.vacationId, booking.Passengers);

    return savedBooking;
}
async function generateNextOrderNumber() {
    try {
        const lastBooking = await BookingModel.findOne().sort({ OrderNumber: -1 }).exec();
        const lastOrderNumber = lastBooking ? parseInt(lastBooking.OrderNumber, 10) : 0;
        const nextOrderNumber = (lastOrderNumber + 1).toString().padStart(6, '0');
        return nextOrderNumber;
    } catch (error) {
        throw new ErrorModel(500, 'Internal Server Error');
    }
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
async function deleteBookingByOrderNumber(orderNumber) {
    const deletedBooking = await BookingModel.findOneAndDelete({ OrderNumber: orderNumber }).exec();
    if (!deletedBooking) throw new ErrorModel(404, `Booking with OrderNumber ${orderNumber} not found`);
    await vacationLogic.updateVacationSpots(deletedBooking.vacationId, (-1) * deletedBooking.Passengers);
    return deletedBooking;
}



async function updateBooking(bookingId, bookingData) {
    const oldBooking = await BookingModel.findById(bookingId).exec();
    if (!oldBooking) throw new ErrorModel(404, `Booking with id ${bookingId} not found`);

    const oldPassengers = oldBooking.Passengers;
    const newPassengers = bookingData.Passengers;

    const updatedBooking = await BookingModel.findByIdAndUpdate(bookingId, bookingData, { new: true, runValidators: true }).exec();
    if (!updatedBooking) throw new ErrorModel(404, `Booking with id ${bookingId} not found`);

    const passengerDifference = newPassengers - oldPassengers;

    if (updatedBooking.status === "cancelled" && oldBooking.status !== "cancelled") {
        await vacationLogic.updateVacationSpots(updatedBooking.vacationId, -oldPassengers);
    } else if (updatedBooking.status !== "cancelled" && oldBooking.status === "cancelled") {
        await vacationLogic.updateVacationSpots(updatedBooking.vacationId, newPassengers);
    } else {
        await vacationLogic.updateVacationSpots(updatedBooking.vacationId, passengerDifference);
    }

    return updatedBooking;
}
async function updateBookingByOrderNumber(orderNumber, bookingData) {
    const oldBooking = await BookingModel.findOne({ OrderNumber: orderNumber }).exec();
    if (!oldBooking) throw new ErrorModel(404, `Booking with OrderNumber ${orderNumber} not found`);

    const oldPassengers = oldBooking.Passengers;
    const newPassengers = bookingData.Passengers;
    const passengerDifference = newPassengers - oldPassengers;

    const updatedBooking = await BookingModel.findOneAndUpdate({ OrderNumber: orderNumber }, bookingData, { new: true, runValidators: true }).exec();
    if (!updatedBooking) throw new ErrorModel(404, `Booking with OrderNumber ${orderNumber} not found`);

    if (updatedBooking.status === "cancelled" && oldBooking.status !== "cancelled") {
        await vacationLogic.updateVacationSpots(updatedBooking.vacationId, -oldPassengers);
    } else if (updatedBooking.status !== "cancelled" && oldBooking.status === "cancelled") {
        await vacationLogic.updateVacationSpots(updatedBooking.vacationId, newPassengers);
    } else {
        await vacationLogic.updateVacationSpots(updatedBooking.vacationId, passengerDifference);
    }

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
async function getBookingByOrderNumber(orderNumber) {
    return BookingModel.findOne({ OrderNumber: orderNumber })
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
async function searchQuery(email, destination, departureMonth) {
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new ErrorModel(404, 'User not found');
        }

        const bookings = await BookingModel.find({ userId: user._id })
            .populate({
                path: 'vacationId',
                populate: [
                    { path: 'companyName', select: 'company' },
                    { path: 'tripCategory', select: 'category' }
                ]
            })
            .populate('userId', 'email')
            .exec();


        const filteredBookings = bookings.filter(booking => {
            const userEmail = booking.userId.email.trim().toLowerCase();
            const vacationDestination = booking.vacationId.destination.trim().toLowerCase();
            const vacationStartDate = new Date(booking.vacationId.startDate);
            const vacationMonth = vacationStartDate.getMonth() + 1; // getMonth() returns 0-11

            return userEmail === email && vacationDestination === destination && vacationMonth === departureMonth;
        });

        const result = filteredBookings.map(booking => ({
            orderNumber: booking.OrderNumber,
            bookingDate: booking.bookingDate,
            destination: booking.vacationId.destination,
            description: booking.vacationId.description,
            startDate: booking.vacationId.startDate,
            endDate: booking.vacationId.endDate,
            groupSize: booking.vacationId.groupOf,
            VacationType: booking.vacationId.vacationType,
            Company: booking.vacationId.companyName.company,
            Category: booking.vacationId.tripCategory.category,
            Rating: booking.vacationId.rating,
            passengers: booking.Passengers,
            totalPrice: booking.vacationId.price
        }));


        return result;
    } catch (error) {
        throw new ErrorModel(500, 'Internal server error');
    }
}



export default {
    createBooking,
    getAllBookings,
    deleteBooking,
    updateBooking,
    getBookingByUserId,
    findOneBooking,
    getBookingByVacationId,
    generateNextOrderNumber,
    getBookingByOrderNumber,
    updateBookingByOrderNumber,
    deleteBookingByOrderNumber,
    searchQuery,
};
