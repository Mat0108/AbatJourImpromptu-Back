const imageModel = require("../models/ImageModel")
const sharp = require("sharp");

exports.createMultipleImage = async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).send("Aucun fichier envoyé");
    }
    const results = [];

    await Promise.all(req.files.map(async (file, pos) => {
      const previewBuffer = await sharp(file.buffer)
        .rotate()
        .resize({ width: 1920, withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      let data = JSON.parse(req.body.data);

      await imageModel.create({
        image: `data:image/jpeg;base64,${previewBuffer.toString("base64")}`,
        grid: [
          {
            gridId: req.body.gridId,
            w: data[pos].w ?? 2,
            h: data[pos].h ?? 2,
            x: data[pos].x,
            y: data[pos].y,
          }
        ]
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
};

// Add an image to a grid (from selection tool in front)
exports.addImagesToGrid = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "items doit être un tableau non vide" });
    }

    const results = [];
    const errors = [];

    for (const item of items) {
      const { imageId, gridId, data = {} } = item;
      const { w = 2, h = 2, x, y } = data;

      if (!imageId || !gridId) {
        errors.push({
          imageId,
          message: "imageId et gridId sont requis"
        });
        continue;
      }

      const image = await imageModel.findById(imageId);

      if (!image) {
        errors.push({
          imageId,
          message: "Image introuvable"
        });
        continue;
      }

      // empêcher les doublons
      const alreadyIn = image.grid.some(
        g => g.gridId?.toString() === gridId.toString()
      );

      if (alreadyIn) {
        errors.push({
          imageId,
          gridId,
          message: "Image déjà présente dans cette grille"
        });
        continue;
      }

      image.grid.push({ gridId, w, h, x, y });
      await image.save();

      results.push({
        imageId,
        gridId,
        message: "Ajoutée avec succès"
      });
    }

    res.status(207).json({
      message: "Traitement terminé",
      successCount: results.length,
      errorCount: errors.length,
      results,
      errors
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de l'ajout multiple à la grille",
      error
    });
  }
};
// Remove a grid entry from an image
exports.removeImageFromGrid = async (req, res) => {
  try {
    const { imageId } = req.body;
    const { gridId } =req.params
    const image = await imageModel.findById(imageId);
    if (!image) {
      return res.status(404).json({ message: "Image introuvable" });
    }

    const initialLength = image.grid.length;
    image.grid = image.grid.filter(g => g.gridId?.toString() !== gridId.toString());

    if (image.grid.length === initialLength) {
      return res.status(404).json({ message: "Cette grille n'est pas associée à l'image" });
    }

    await image.save();
    res.status(200).json({ message: "Image retirée de la grille", image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression de la grille", error });
  }
};

// Get all images NOT present in a given grid
exports.getImagesNotInGrid = async (req, res) => {
  try {
    const { gridId } = req.params;
    let images = {}
    if (!gridId) {
      images = await imageModel.find();
    }else{ 
      images = await imageModel.find({
      "grid.gridId": { $ne: gridId }
    });
    } 

    res.status(200).json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des images", error });
  }
};

exports.updatePositionImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const {gridId, w, h, x, y } = req.body;

    const image = await imageModel.findOneAndUpdate(
      { _id: imageId, "grid.gridId": gridId },
      {
        $set: {
          "grid.$.w": w,
          "grid.$.h": h,
          "grid.$.x": x,
          "grid.$.y": y,
        }
      },
      { new: true }
    );

    if (!image) {
      return res.status(404).json({ message: "Image ou grille introuvable" });
    }

    res.json({ message: "La position de l'image a bien été modifiée", image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la position", error });
  }
};

exports.updatePositionsImages = async (req, res) => {
  try {
    const updates = req.body; // [{ id, gridId, data: { w, h, x, y } }]

    const bulkOps = updates.map(item => ({
      updateOne: {
        filter: { _id: item.id, "grid.gridId": item.gridId },
        update: {
          $set: {
            "grid.$.w": item.data.w,
            "grid.$.h": item.data.h,
            "grid.$.x": item.data.x,
            "grid.$.y": item.data.y,
          }
        }
      }
    }));

    const result = await imageModel.bulkWrite(bulkOps);

    res.json({
      message: "Positions des images mises à jour",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erreur lors de la mise à jour", error });
  }
};

exports.rotateImage = async (req, res) => {
  try {
    const image = await imageModel.findById(req.params.imageId);
    if (!image) {
      return res.status(404).json({ message: "Image introuvable" });
    }

    const rotatedBuffer = await sharp(
      Buffer.from(image.image.replace(/^data:.+;base64,/, ""), "base64")
    )
      .rotate(req.body.angle ?? 90)
      .toBuffer();

    const newImage = `data:image/jpeg;base64,${rotatedBuffer.toString("base64")}`;
    image.image = newImage;
    await image.save();

    res.status(200).json({ image: newImage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Impossible de faire pivoter l'image", error });
  }
};

exports.getImage = async (req, res) => {
  try {
    const image = await imageModel.findById(req.params.imageId);
    if (!image) {
      return res.status(404).json({ message: "Image introuvable" });
    }
    res.status(200).json(image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Impossible de récupérer l'image", error });
  }
};

exports.getImageByGrid = async (req, res) => {
  try {
    const { gridId } = req.params;
    if (!gridId) {
      return res.status(400).json({ message: "gridId est requis" });
    }

    const images = await imageModel.find({ "grid.gridId": gridId });
    res.status(200).json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Impossible de récupérer les images", error });
  }
};

exports.removeImage = async (req, res) => {
  try {
    const image = await imageModel.findByIdAndDelete(req.params.imageId);
    if (!image) {
      return res.status(404).json({ message: "Image introuvable" });
    }
    res.status(200).json(image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Impossible de supprimer l'image", error });
  }
};
