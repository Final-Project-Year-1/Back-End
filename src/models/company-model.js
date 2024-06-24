import mongoose, { Schema } from "mongoose";

const CompanySchema = new Schema({
    company: {
        type: String,
        required: true
    },
}, {
    versionKey: false
});

const CompanyModel = mongoose.model("Company", CompanySchema, "company-name");
export default CompanyModel;