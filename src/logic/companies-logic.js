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
        const companies = await CompanyModel.find({}, { _id: 1, company: 1 }).exec();
        return companies;
    } catch (err) {
        console.error("Error in getAllCompanies:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}
async function deleteCompany(companyId) {
    const deletedCompany = await CompanyModel.findByIdAndDelete(companyId).exec();
    if (!deletedCompany) throw new ErrorModel(404, `Company with id  ${companyId} not found`);
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
