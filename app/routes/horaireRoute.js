
module.exports = (server,corsConfig) => {
    const horaireController = require("../controllers/horaireController")
    const cors = require("cors")
    
    server.post("/createHoraire",cors(corsConfig),horaireController.createHoraire);
    server.get("/horaire/:horaireId",cors(corsConfig),horaireController.getHoraire);
    server.post("/horaire/:horaireId",cors(corsConfig),horaireController.updateHoraire);

}