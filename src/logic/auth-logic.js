import cyber from '../utils/cyber.js';
import UserModel from "../models/user-model.js";
import ErrorModel from '../models/error-model.js';
import mongoose from 'mongoose';

async function register(user) {

    const errors = user.validateSync();
    if (errors) throw new ErrorModel(400, errors.message);

    const isTaken = await isEmailTaken(user);
    if (isTaken) {
        throw new ErrorModel(400, `email ${user.email} already taken`);
    }

    user.password = cyber.hash(user.password);

    user.save();

    delete user.password;

    const token = cyber.getNewToken(user);

    return token;
}
async function login(credentials) {

    const errors = credentials.validateSync();
    if (errors) throw new ErrorModel(400, errors.message);

    credentials.password = cyber.hash(credentials.password);

    const existingUser = await UserModel.findOne({ email: credentials.email, password: credentials.password }).exec();

    if (!existingUser) {
        throw new ErrorModel(401, "Incorrect email or password");
    }

    delete existingUser.password;

    const token = cyber.getNewToken(existingUser);

    return token;
}
async function findUserById(userId) {
    return UserModel.findById(userId).select('email lastName firstName').exec();
}

async function findUserByEmail(email) {
    return UserModel.findOne({ email: email }).select('email lastName firstName').exec();
}

async function updateUser(userId, userData) {
    if (userData.password) {
        userData.password = cyber.hash(userData.password);
    }
    const updatedUser = await UserModel.findByIdAndUpdate(userId, userData, { new: true, runValidators: true }).exec();
    if (!updatedUser) {
        throw new ErrorModel(404, `User with id ${userId} not found`);
    }
    return updatedUser;
}

async function getAllUsers() {
    return UserModel.find().select('email lastName firstName')
        .exec();
}

async function getUserCount() {
    try {
        const count = await UserModel.countDocuments();
        return { userCount: count };
    } catch (err) {
        console.error("Error in getUserCount:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}

async function isEmailTaken(user) {
    const foundUser = await UserModel.findOne({ email: user.email });
    return foundUser !== null;
}

export default {
    register,
    login,
    findUserById,
    getAllUsers,
    getUserCount,
    updateUser,
    findUserByEmail,
}