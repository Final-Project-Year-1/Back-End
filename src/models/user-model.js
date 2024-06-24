import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: [true, "Missing first name"],
        minlength: [2, "First name is too short"],
        maxlength: [20, "First name is too long"],
        match: [/^([a-zA-Z]*)$/, "Invalid First Name"],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, "Missing last name"],
        minlength: [2, "Last name is too short"],
        maxlength: [20, "Last name is too long"],
        match: [/^([a-zA-Z]*)$/, "Invalid Last Name"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Missing Email"],
        minlength: [5, "Email is too short"],
        maxlength: [150, "Email is too long"],
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid Email"],
        trim: true,
        unique: true
    },
    nationality: {
        type: String,
        required:[true, "Missing Country"],
        minlength:[4, "Country is too short"],
        maxlength: [56, "Country is too long"],
        match: [/^([a-zA-Z]*)$/, "Invalid Country"],
        trim: true
    },
    birthDate: {
        type: Date,
        required: [true, "Missing Birth Date"]
      },
      gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: [true, "Missing Gender"]
    },
    passportDetails: {
        passportNumber: {
            type: String,
            minlength: [8, "Passport number is too short"],
            maxlength: [9, "Passport number is too long"],
            match: [/^[A-PR-WYa-pr-wy][1-9]\d\s?\d{4}[1-9]$/, "Invalid Passport Number"]
        },
        issueDate: {
            type: Date
        },
        expiryDate: {
            type: Date
        }
    },
    password: {
        type: String,
        required: [true, "Missing Password"],
        minlength: [8, "Password is too short"],
        match: [/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, "Password must contain at least one letter or number"],
        trim: true
    },
    role: {
        type:String,
        default: "user"
    }
}, {
    versionKey: false,
    toJSON: { virtuals: true },
    id: false
});

const UserModel = mongoose.model("UserModel", UserSchema, "users");
export default UserModel;
