const multer = require("multer");
module.exports = (server,corsConfig) => {
    const imageController = require("../controllers/imageController");
    const cors = require('cors');

    const upload = multer({ storage: multer.memoryStorage() });

    server.post("/images/createMulti",upload.array('files',10),cors(corsConfig),imageController.createMultipleImage)
   
    server.post("/image/:imageId/updatePosition",cors(corsConfig),imageController.updatePositionImage)
    server.post("/image/:imageId/rotateImage",cors(corsConfig),imageController.rotateImage)
    server.get("/image/:imageId",cors(corsConfig),imageController.getImage);

    server.get("/grid/:gridId",cors(corsConfig),imageController.getImageByGrid)
    server.post("/grid/update",cors(corsConfig),imageController.updatePositionsImages)

}