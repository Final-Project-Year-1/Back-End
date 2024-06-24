// createVacation 
// deleteVacation
// update
// fetch all

import ErrorModel from "../models/error-model.js";
import VacationModel from "../models/vacation-model.js";

async function getAllVacations() {

    return VacationModel.find().populate('companyName').populate('tripCategory').exec();
}

function createVacation(vacation) {
    const errors = vacation.validateSync();
    if (errors) throw new ErrorModel(400, errors.message);
    return vacation.save()
}
export default
    {
        createVacation,
        getAllVacations
    }