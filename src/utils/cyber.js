import jwt from "jsonwebtoken";
import crypto from "crypto";

const salt = "weWillRockYou"; 

function hash(plainText) {

    if(!plainText) return null;

    const hashedText = crypto.createHmac("sha512", salt).update(plainText).digest("hex");

    return hashedText;
}


const secretKey = "DavidBowie";

function getNewToken(user) {

    const payload = { user };

    const token = jwt.sign(payload, secretKey, { expiresIn: "2h" });

    return token;
}

function verifyToken(authorizationHeader){

    return new Promise((resolve, reject) => {

        if(!authorizationHeader) {
            resolve(false);
            return;
        }

        const token = authorizationHeader.split(" ")[1];

        if(!token) {
            resolve(false);
            return;
        }

        jwt.verify(token, secretKey, (err) => {

            if(err) {
                resolve(false);
                return;
            }

            resolve(true);
        });

    });
    
}


function getUserFromToken(authorizationHeader) {

    const token = authorizationHeader.split(" ")[1];

    const payload = jwt.decode(token);

    const user = payload.user;

    return user;
}

export default {
    getNewToken,
    verifyToken,
    hash,
    getUserFromToken
};