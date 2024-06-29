import ErrorModel from "../models/error-model.js";
import VacationModel from "../models/vacation-model.js";
import CompanyModel from "../models/company-model.js";
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getAllVacations() {
    return VacationModel.find()
        .populate("companyName")
        .populate("tripCategory")
        .exec();
}

async function getOneVacation(_id) {
    const vacation = await VacationModel.findById(_id)
        .populate("companyName")
        .populate("tripCategory")
        .exec();
    if (!vacation) throw new ErrorModel(404, `_id ${_id} not found`);
    return vacation;
}

async function createVacation(vacation) {
    const errors = vacation.validateSync();

    if (vacation.image) {
        const extension = vacation.image.name.substring(vacation.image.name.lastIndexOf("."));
        vacation.imageName = uuid() + extension;
        await vacation.image.mv(path.join(__dirname, ".." , "assets", "images", "vacations", vacation.imageName));
        delete vacation.image;
    }

    if (errors) throw new ErrorModel(400, errors.message);
    return vacation.save();
}

async function updateVacation(vacation) {
    const errors = vacation.validateSync();
    if (errors) throw new ErrorModel(400, errors.message);

    if (vacation.image) {
        const extension = vacation.image.name.substring(vacation.image.name.lastIndexOf("."));
        vacation.imageName = uuid() + extension;
        await vacation.image.mv(path.join(__dirname, ".." , "assets", "images", "vacations", vacation.imageName));
        delete vacation.image;
    }

    const updatedVacation = await VacationModel.findByIdAndUpdate(vacation._id, vacation, { returnOriginal: false }).exec();
    if (!updatedVacation) throw new ErrorModel(404, `_id ${vacation._id} not found`);

    return updatedVacation;
}

async function deleteVacation(_id) {
    const deletedVacation = await VacationModel.findByIdAndDelete(_id).exec();
    if (!deletedVacation) throw new ErrorModel(404, `_id ${_id} not found`);
}

async function getTotalVacations() {
    try {
        const totalVacations = await VacationModel.countDocuments({});
        return { totalVacations };
    } catch (err) {
        console.error("Error in getTotalVacations:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}

async function getTotalVacationsByCompany(companyId) {
    try {
        const company = await CompanyModel.findById(companyId);
        if (!company) {
            throw new ErrorModel(404, `Company with id ${companyId} not found`);
        }

        const vacations = await VacationModel.find({ companyName: companyId }, '_id');
        
        const detailedVacations = await Promise.all(vacations.map(async (vacation) => {
            const detailedVacation = await getOneVacation(vacation._id);
            return {
                vacationId: detailedVacation._id,
                vacationName: detailedVacation.name,
                vacationDescription: detailedVacation.description,
            };
        }));

        const totalVacations = vacations.length;
        return { companyId: company._id, companyName: company.company, totalVacations, vacations: detailedVacations };
    } catch (err) {
        console.error("Error in getTotalVacationsByCompany:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}
async function getTopVacations() {
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
    getAllVacations,
    getOneVacation,
    createVacation,
    getVacationsByCompany,
    updateVacation,
    deleteVacation,
    getTotalVacations,
    getTopVacations,
    getTotalVacationsByCompany,
};
