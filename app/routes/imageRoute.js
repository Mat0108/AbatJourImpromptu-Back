const multer = require("multer");
module.exports = (server,corsConfig) => {
    const imageController = require("../controllers/imageController");
    const cors = require('cors');

    const upload = multer({ storage: multer.memoryStorage() });

    
    server.post("/image/:imageId/updatePosition",cors(corsConfig),imageController.updatePositionImage)
    server.post("/image/:imageId/rotateImage",cors(corsConfig),imageController.rotateImage)
    server.get("/image/:imageId",cors(corsConfig),imageController.getImage);
    server.delete("/image/:imageId",cors(corsConfig),imageController.removeImage)
    server.post("/image/:imageId/removeImageFromGrid",cors(corsConfig),imageController.removeImageFromGrid)
    server.post("/image/:imageId/updateDescription",cors(corsConfig),imageController.updateDescription)

    server.get("/grid/:gridId",cors(corsConfig),imageController.getImageByGrid)
    server.post("/grid/:gridId/getImageNotPresent",cors(corsConfig),imageController.getImagesNotInGrid)
    server.post("/grid/:gridId/removeImage",cors(corsConfig),imageController.removeImageFromGrid)
   
    server.post("/grid/update",cors(corsConfig),imageController.updatePositionsImages)
    server.post("/grid/createMulti",upload.array('files',10),cors(corsConfig),imageController.createMultipleImage)
    
    server.post("/grid/addImages",cors(corsConfig),imageController.addImagesToGrid)


    
}