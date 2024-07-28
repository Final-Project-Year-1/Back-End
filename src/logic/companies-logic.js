import CompanyModel from "../models/company-model.js";
import ErrorModel from "../models/error-model.js";
import vacationLogic from "../logic/vacation-logic.js"
import VacationModel from "../models/vacation-model.js";

//We don't need this
async function getTotalCompanies() {
    try {
        const totalCompanies = await CompanyModel.countDocuments({ company: { $ne: "Cancelled" } });
        return { totalCompanies: totalCompanies - 1 };
    } catch (err) {
        console.error("Error in getTotalCompanies:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}
async function createCompany(company) {
    try {
        // בדוק אם שם החברה כבר קיים באופן לא רגיש לגודל אותיות
        const existingCompany = await CompanyModel.findOne({ 
            company: { $regex: new RegExp(`^${company.company}$`, 'i') } 
        });

        if (existingCompany) {
            throw new ErrorModel(400, `Company with name ${company.company} already exists`);
        }

        // שמור את החברה במסד הנתונים
        await company.save();

        return company;
    } catch (err) {
        // ניהול שגיאות
        console.error("Error creating company:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}

async function findCompanyById(_id) {
    const company = await CompanyModel.findById(_id).exec();
    if (!company) throw new ErrorModel(404, `Company with _id ${_id} not found`);
    return company;
}
async function updateCompanyName(companyId, companyData) {
    // קודם כל בדיקה אם שם החברה כבר קיים במסד הנתונים (לא כולל את הרשומה הנוכחית) בצורה לא רגישה לגודל האותיות
    const existingCompany = await CompanyModel.findOne({
        _id: { $ne: companyId },
        company: { $regex: new RegExp(`^${companyData.company}$`, 'i') } // השימוש ב-RegExp עם 'i' להתעלמות מגודל אותיות
    }).exec();

    if (existingCompany) {
        throw new ErrorModel(400, `Company name ${companyData.company} already exists`);
    }

    // אם השם לא קיים, ממשיכים לעדכון
    const updatedCompany = await CompanyModel.findByIdAndUpdate(companyId, companyData, { new: true, runValidators: true }).exec();
    if (!updatedCompany) {
        throw new ErrorModel(404, `Company with id ${companyId} not found`);
    }
    return updatedCompany;
}
async function getAllCompanies() {
    try {
        // מציאת כל החברות, לא כולל חברות בשם "Cancelled"
        const companies = await CompanyModel.find({ company: { $ne: "Cancelled" } }, { _id: 1, company: 1 }).exec();
        return companies;
    } catch (err) {
        console.error("Error in getAllCompanies:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}
async function deleteCompany(companyId) {
    const deletedCompany = await CompanyModel.findByIdAndDelete(companyId).exec();
    if (!deletedCompany) throw new ErrorModel(404, `Company with id ${companyId} not found`);

    const vacations = await VacationModel.find({ companyName: companyId }).exec();

    for (const vacation of vacations) {
        await vacationLogic.deleteVacation(vacation._id);
    }

    return deletedCompany;
}
export default {
    getTotalCompanies,
    getAllCompanies,
    createCompany,
    updateCompanyName,
    deleteCompany,
    findCompanyById,
};
