import mongoose, { Schema } from "mongoose";

const CredentialsSchema = new Schema({
    email: {
        type: String,
        required: [true, "Missing Email"],
        minlength: [5, "Email is too short"],
        maxlength: [150, "Email is too long"],
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid Email"],
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, "Missing Password"],
        minlength: [8, "Password is too short"],
        match: [/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one letter and one number, and can include special characters"],
        trim: true
    }
}, {
    versionKey: false
});

const CredentialsModel = mongoose.model("CredentialsModel", CredentialsSchema, "credentials");

export default CredentialsModel;
