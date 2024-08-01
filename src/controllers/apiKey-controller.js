import express from "express";

const router = express.Router();

router.get("/api-key/weather", async (request, response) => {
    try {
        const apiKey = process.env.API_KEY_WEATHER

        if(!apiKey){
            return response.status(404).json('api key not found')
        }
        response.status(200).json(apiKey);
    }
    catch (err) {
        console.log(err);
        response.json(err);
    }
});

router.get("/api-key/maps", async (request, response) => {
    try {
        const apiKey = process.env.API_KEY_MAPS
        if(!apiKey){
            return response.status(404).json('api key not found')
        }

        response.status(200).json(apiKey);
    }
    catch (err) {
        console.log(err);
        response.json(err);
    }
});

router.get("/api-key/facebook", async (request, response) => {
    try {
        const apiKey = process.env.ACCESS_TOKEN
        if(!apiKey){
            return response.status(404).json('api key not found')
        }

        response.status(200).json(apiKey);
    }
    catch (err) {
        console.log(err);
        response.json(err);
    }
});


export default router