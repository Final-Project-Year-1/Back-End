import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    imagePath: {
        type: String,
        required: true
    }
});

const ImageModel = mongoose.model('Image', imageSchema);

export default ImageModel;
