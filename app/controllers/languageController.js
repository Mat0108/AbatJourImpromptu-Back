const languageModel = require("../models/languageModel")
const languageId = "69b42fc1ab73e7ee4c584e13"
exports.getLanguage = (req,res)=>{
    languageModel.findById(languageId,(error,language)=>{
        if(error){
            res.status(401);
            res.json({message:"Erreur de la récupération du dictionnaire"})
        }else{
            res.status(200);
            res.json(language)
        }
    })
}

exports.editValue = (req,res)=>{
    languageModel.findByIdAndUpdate(languageId,req.body,{new:true},(error,language)=>{
        if(error){
            res.status(401);
            res.json({message:"Impossible de modifier le dictionnaire"})
        }else{
            res.status(200);
            res.json(language)
        }
    })
}