import ErrorModel from "../models/error-model.js";
import VacationModel from "../models/vacation-model.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

export default {
    getAllVacations,
    getOneVacation,
    createVacation,
    updateVacation,
    deleteVacation
};