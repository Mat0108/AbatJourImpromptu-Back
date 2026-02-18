const imageModel = require("../models/ImageModel")
const sharp = require("sharp");

function removeExtension(filename) {
  return filename?.replace(/\.[^/.]+$/, ""); 
}


exports.createMultipleImage = async (req,res)=>{
    try {
      if (!req.files?.length) {
        return res.status(400).send("Aucun fichier envoyé");
      }
      const results = []

     await Promise.all(req.files.map(async (file) => {
        const previewBuffer = await sharp(file.buffer)
          .rotate()
          .resize({ width: 1920, withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();

        await imageModel.create({
          image: `data:image/jpeg;base64,${previewBuffer.toString("base64")}`,
          gridId: req.body.gridId,
          width: 1,
          height: 1
        });

        results.push({
          filename: file.originalname,
          status: "ok"
        });
      }));

        res.json({ message: "Upload terminé", results });
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
}

exports.updatePositionImage = (req,res)=>{
    imageModel.findByIdAndUpdate(req.params.imageId,{width:req.body.width,height:req.body.height,x:req.body.x,y:req.body.y},(image,error)=>{
        if(error){                
            res.status(401);
            res.json({message:"Impossible de créer un tableau"})
        }else{
            res.json({message:"La position de l'image a bien été modifié",image});
        }
    })
}

exports.updatePositionsImages = async (req, res) => {
  try {
    const updates = req.body; // array
    console.log('updates : ', updates)

    const bulkOps = updates.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: item.data }
      }
    }));

    const result = await imageModel.bulkWrite(bulkOps);

    res.json({
      message: "Positions des images mises à jour",
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la mise à jour",
      error
    });
  }
};

exports.rotateImage = (req,res) => {
  imageModel.findById(`${req.params.imageId}`).exec(async (error,image)=>{
        if (error) {
            res.status(401);
            res.json({message:"Impossible de récupérer l'image "})
        }
        else {
          const rotatedBuffer = await sharp(Buffer.from(image.imageBase64.replace(/^data:.+;base64,/, ""),"base64")).rotate(req.body.angle ?? 90).toBuffer();
          imageModel.findByIdAndUpdate(`${req.params.tableauId}`,{imageBase64:`data:image/jpeg;base64,${rotatedBuffer.toString("base64")}`}).exec((error,image)=>{
        if (error) {
            res.status(401);
            res.json({message:"Impossible de récupérer l'image"})
        }
        else {
            res.status(200);
            res.json({imageBase64:`data:image/jpeg;base64,${rotatedBuffer.toString("base64")}`});
        }
  })
        }
  })
}

exports.getImage = (req,res) =>{
  imageModel.findById(`${req.params.imageId}`).exec(async (error,image)=>{
    if(error){
      res.status(401);
      res.json({message:"Impossible de récupérer l'image"})
    }else{
      res.status(200);
      res.json(image)
    }
  })
}

exports.getImageByGrid = (req,res)=>{
  if(req.params.gridId){
    imageModel.find({gridId:req.params.gridId}).exec(async (error,images)=>{
    if(error){
      res.status(401);
      res.json({message:"Impossible de récupérer les images"})
    }else{
      res.status(200);
      res.json(images)
    }})
  }else{
    res.status(401);
    res.json({message:"Impossible de récupérer les images"})
  }
}