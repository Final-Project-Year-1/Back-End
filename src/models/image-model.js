const imageSchema = new mongoose.Schema({
    imagePath: String
  });
  
  const ImageModel = mongoose.model('Image', imageSchema);