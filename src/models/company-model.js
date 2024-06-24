import mongoose, { Schema } from "mongoose";

const CompanySchema = new Schema({
    company: {
        type: String,
        required: true
    },
}, {
    versionKey: false
});

const CompanyModel = mongoose.model("CompanyModel", CompanySchema, "company-name");
export default CompanyModel;