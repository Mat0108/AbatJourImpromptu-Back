const horaireModel = require("../models/horaireModel")
exports.createHoraire = (req,res)=>{
    let newHoraire = new horaireModel(req.body);
    newHoraire.save((error,horaire)=>{
        if(error){
            res.status(401);
            res.json({message:"Erreur de la création d'horaire"})
        }else{
            res.status(200);
            res.json(horaire)
        }
    })
}
exports.getHoraire = (req,res)=>{
    horaireModel.findById(req.params.horaireId,(error,horaire)=>{
        if(error){
            res.status(401);
            res.json({message:"Erreur de la récupération de l'horaire"})
        }else{
            res.status(200);
            res.json(horaire)
        }
    })
}
exports.updateHoraire = (req,res)=>{
    horaireModel.findByIdAndUpdate(req.params.horaireId,req.body,(error,horaire)=>{
        if(error){
            res.status(401);
            res.json({message:"Erreur de la récupération de l'horaire"})
        }else{
            res.status(200);
            res.json(horaire)
        }})
}