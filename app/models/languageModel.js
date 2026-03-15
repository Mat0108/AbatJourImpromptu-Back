const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let languageSchema = new Schema({},{strick:false});

module.exports = mongoose.model("language", languageSchema,"language");