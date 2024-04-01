const mongoose = require('mongoose');

const clothingCategorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    length: {
        type: Number,
        required: true
    },
    width: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    }
});


const ClothingCategory = mongoose.model('ClothingCategory', clothingCategorySchema);

module.exports = ClothingCategory;
