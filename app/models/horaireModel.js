const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let horaireSchema = new Schema({
    _id: {  
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true,
        auto: true
    },    
    lundi:{type: String},
    mardi: {type: String},
    mercredi: {type: String},
    jeudi: {type: String},
    vendredi:{type: String},
    samedi:{type:String},
    dimanche:{type:String},
    special_horaire: {start:{type:Date}, end:{type:Date}}
   
});

module.exports = mongoose.model("horaire", horaireSchema,"horaire");