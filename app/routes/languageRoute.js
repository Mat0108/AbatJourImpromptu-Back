module.exports = (server,corsConfig) => {
    const languageController = require("../controllers/languageController")
    const cors = require('cors')
    server.get("/language",cors(corsConfig),languageController.getLanguage);
    server.post("/language/edit",cors(corsConfig),languageController.editValue);
}