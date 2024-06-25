import mongoose from 'mongoose';
import BookingModel from "../models/booking-model.js";
import ErrorModel from '../models/error-model.js';
import CompanyModel from '../models/company-model.js';

async function getBookingsByCompanyByMonth() {
    try {
        const result = await BookingModel.aggregate([
            {
                $group: {
                    _id: {
                        companyName: "$companyName",
                        year: { $year: "$bookingDate" },
                        month: { $month: "$bookingDate" }
                    },
                    totalBookings: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'company-name',
                    localField: '_id.companyName',
                    foreignField: '_id',
                    as: 'company'
                }
            },
            {
                $unwind: "$company"
            },
            {
                $project: {
                    _id: 0,
                    companyId: "$_id.companyName",
                    companyName: "$company.company",
                    year: "$_id.year",
                    month: "$_id.month",
                    totalBookings: 1
                }
            },
            {
                $sort: {
                    companyName: 1,
                    year: 1,
                    month: 1
                }
            }
        ]);

        if (!result || result.length === 0) {
            throw new ErrorModel(404, "No bookings found");
        }

        return result;
    } catch (err) {
        console.error("Error in getBookingsByCompanyByMonth:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}

async function getBookingsByMonthForCompany(companyId) {
    try {
        const company = await CompanyModel.findById(companyId);
        if (!company) {
            throw new ErrorModel(404, "Company not found");
        }

        const result = await BookingModel.aggregate([
            {
                $match: { companyName: new mongoose.Types.ObjectId(companyId) } 
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$bookingDate" },
                        month: { $month: "$bookingDate" }
                    },
                    totalBookings: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    totalBookings: 1
                }
            },
            {
                $sort: {
                    year: 1,
                    month: 1
                }
            }
        ]);

        if (!result || result.length === 0) {
            throw new ErrorModel(404, "No bookings found for this company");
        }

        return {
            companyName: company.company,
            bookings: result
        };
    } catch (err) {
        console.error("Error in getBookingsByMonthForCompany:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}

async function getTotalBookingsByMonth(month) {
    try {
        const result = await BookingModel.aggregate([
            {
                $match: { $expr: { $eq: [{ $month: "$bookingDate" }, parseInt(month)] } }
            },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalBookings: 1
                }
            }
        ]);

        if (!result || result.length === 0) {
            throw new ErrorModel(404, "No bookings found for this month");
        }

        return {
            month: parseInt(month),
            totalBookings: result[0].totalBookings
        };
    } catch (err) {
        console.error("Error in getTotalBookingsByMonth:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}


export default {
    getBookingsByCompanyByMonth,
    getBookingsByMonthForCompany,
    getTotalBookingsByMonth,
}
