const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let imageSchema = new Schema({
    _id: {  
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true,
        auto: true
    },     
    image: { type: String },
    grid: [
        {
        gridId: { type: String, required: true },
        w: { type: Number },
        h: { type: Number },
        x: { type: Number },
        y: { type: Number }
        }
    ]
});

module.exports = mongoose.model("images", imageSchema,"images");