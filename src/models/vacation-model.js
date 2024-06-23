import mongoose, { Schema } from "mongoose";

const VacationSchema = new Schema({
    destination:{
        type: String,
        required: [true, "Missing destination"],
        minlength: [2, "destination name is too short"],
        trim: true
    },
    description:{
        type: String,
        required: [true, "Missing description"],
        minlength: [2, "description name is too short"],
        trim: true
    },
    startDate:{
        type: Date
    },
    endDate:{
       type: Date
    },
    price:{
        type: Number,
        required: [true, "Missing price"],
        min: [0, "Price can't be negative"],
        max: [50000, "Price can't exceed 50000"]
    },
    groupOf:{
        type: Number,
        required: [true, "Missing group number"],
        min: [1, "group number can't be negative"],
        max: [100, "group number can't exceed 50000"]
    },
    vacationType:{
        enum: ['All-Inclusive', 'Bed and Breakfast'],
        required: true
    },
    companyName:{
        type: Schema.Types.ObjectId
    },
    tripCategory:{
       type: Schema.Types.ObjectId
    },
    image: {
        type: Object, 
    },
    imageName:{
        type: String,
    },
}, {
    versionKey:false, 
    toJSON:{virtuals:true},
    id: false
});

const VacationModel = mongoose.model("VacationModel", VacationSchema, "vacations");

export default VacationModel;