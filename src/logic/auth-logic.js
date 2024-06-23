import cyber from '../utils/cyber.js';
import UserModel from "../models/user-model.js";
import ErrorModel from '../models/error-model.js';


async function register(user) {

    const errors = user.validateSync();
    if (errors) throw new ErrorModel(400, errors.message);

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

export default {
    register,
    login,
}