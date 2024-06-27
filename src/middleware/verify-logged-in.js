import ErrorModel from "../models/error-model.js";
import cyber from "../utils/cyber.js";

async function verifyLoggedIn(request, response, next) {
    try {
        const authorizationHeader = request.header("authorization");

        const isValid = await cyber.verifyToken(authorizationHeader);

        if (!isValid) {
            return response.status(401).json(new ErrorModel(401, "Something went wrong... You are not logged in"));
        }

        next();

    } catch (error) {
        return response.status(500).json(new ErrorModel(500, "Internal server error"));
    }
}

export default verifyLoggedIn;
