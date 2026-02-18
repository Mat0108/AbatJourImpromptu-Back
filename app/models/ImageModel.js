const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let imageSchema = new Schema({
    _id: {  
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true,
        auto: true
    },     
    image: { type: String},
    w:{type: Number},
    h: {type: Number},
    x:{type: Number},
    y:{type: Number},
    gridId:{type:String}
   
});

module.exports = mongoose.model("images", imageSchema,"images");