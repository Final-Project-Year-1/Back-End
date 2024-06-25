import ErrorModel from "../models/error-model.js";
import VacationModel from "../models/vacation-model.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import CompanyModel from "../models/company-model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
        vacation.imageName = vacation._id + extension;
        await vacation.image.mv(path.join(__dirname, "..", "assets", "images", "vacations", vacation.imageName));
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
        vacation.imageName = vacation._id + extension;
        await vacation.image.mv(path.join(__dirname, "..", "assets", "images", "vacations", vacation.imageName));
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

        const totalVacations = await VacationModel.countDocuments({ companyName: companyId });
        return { companyId: company._id, companyName: company.company, totalVacations };
    } catch (err) {
        console.error("Error in getTotalVacationsByCompany:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}
export default {
    getAllVacations,
    getOneVacation,
    createVacation,
    updateVacation,
    deleteVacation,
    getTotalVacations,
    getTotalVacationsByCompany,
};
