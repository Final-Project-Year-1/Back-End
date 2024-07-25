import mongoose from "mongoose";
import config from './utils/config.js'

async function connect() {
    try {
        const db = await mongoose.connect(config.connectionString);
        console.log("We're connected to MongoDB " + db.connections[0].name); 
    }
    catch(err) {
        console.log(err);
    }
}

export default {
    connect
};