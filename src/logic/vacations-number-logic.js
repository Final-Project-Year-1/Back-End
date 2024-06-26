import mongoose from 'mongoose';
import VacationModel from "../models/vacation-model.js";
import CompanyModel from "../models/company-model.js";
import ErrorModel from '../models/error-model.js';


async function getTopCompany() {
    try {
        const vacationsByCompany = await getVacationsByCompany();
        const maxVacations = Math.max(...vacationsByCompany.map(company => company.totalVacations));
        const topCompanies = vacationsByCompany.filter(company => company.totalVacations === maxVacations);

        if (!topCompanies.length) {
            throw new ErrorModel(404, "No companies found");
        }

        return topCompanies;
    } catch (err) {
        console.error("Error in getTopCompany:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}

//adding a count of total vacations for each company
//and sorts the companies by the number of vacations in descending order
async function getVacationsByCompany() {
    try {
        const result = await CompanyModel.aggregate([
            {
                $lookup: {
                    from: 'vacations', 
                    localField: '_id',
                    foreignField: 'companyName',
                    as: 'vacations'
                }
            },
            {
                $addFields: {
                    totalVacations: { $size: "$vacations" }
                }
            },
            {
                $project: {
                    _id: 0,
                    companyId: "$_id",
                    totalVacations: 1,
                    company: "$company"
                }
            },
            {
                $sort: { totalVacations: -1 }
            }
        ]);

        if (!result || result.length === 0) {
            throw new ErrorModel(404, "No companies found");
        }

        return result;
    } catch (err) {
        console.error("Error in getVacationsByCompany:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}

export default {
    getTopCompany,
    getVacationsByCompany,
}
