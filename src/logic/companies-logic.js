import CompanyModel from "../models/company-model.js";
import ErrorModel from "../models/error-model.js";

//We don't need this
async function getTotalCompanies() {
    try {
        const totalCompanies = await CompanyModel.countDocuments({});
        return { totalCompanies };
    } catch (err) {
        console.error("Error in getTotalCompanies:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}

async function getAllCompanies() {
    try {
        const companies = await CompanyModel.find({}, { _id: 1, company: 1 }).exec();
        return companies;
    } catch (err) {
        console.error("Error in getAllCompanies:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}

export default {
    getTotalCompanies,
    getAllCompanies,
};
