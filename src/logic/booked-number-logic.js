import mongoose from 'mongoose';
import BookingModel from "../models/booking-model.js";
import ErrorModel from '../models/error-model.js';
import CompanyModel from "../models/company-model.js";

// 1
async function getTopBookedCompany() {
    try {
        const bookingsByCompany = await getBookingsByCompany();
        const maxBookings = Math.max(...bookingsByCompany.map(company => company.totalBookings));
        const topCompanies = bookingsByCompany.filter(company => company.totalBookings === maxBookings);

        if (!topCompanies.length) {
            throw new ErrorModel(404, "No companies found");
        }

        return topCompanies;
    } catch (err) {
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}
// 2
async function getBookingsByCompany() {
    try {
        const result = await CompanyModel.aggregate([
            {
                $lookup: {
                    from: 'bookings',
                    localField: '_id',
                    foreignField: 'companyName',
                    as: 'bookings'
                }
            },
            {
                $addFields: {
                    totalBookings: { $size: "$bookings" }
                }
            },
            {
                $project: {
                    _id: 0,
                    companyId: "$_id",
                    totalBookings: 1,
                    company: "$company"
                }
            },
            {
                $sort: { totalBookings: -1 } 
            }
        ]);

        if (!result || result.length === 0) {
            throw new ErrorModel(404, "No companies found");
        }

        return result;
    } catch (err) {
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}

export default {
    getTopBookedCompany,
    getBookingsByCompany,
}
