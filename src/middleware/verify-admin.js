import ErrorModel from "../models/error-model.js";
import cyber from "../utils/cyber.js";

async function verifyAdmin(request, response, next) {
    try {
        const authorizationHeader = request.header("authorization"); 

        if (!authorizationHeader) {
            return response.status(401).json(new ErrorModel(401, "You are not logged in"));
        }

        const isValid = await cyber.verifyToken(authorizationHeader);

        if (!isValid) {
            return response.status(401).json(new ErrorModel(401, "You are not logged in"));
        }

        const user = cyber.getUserFromToken(authorizationHeader);

        if (user.role !== "admin") {
            return response.status(403).json(new ErrorModel(403, "You are not authorized"));
        }

        next();
    } catch (error) {
        return response.status(500).json(new ErrorModel(500, "Internal server error"));
    }
}

export default verifyAdmin;
