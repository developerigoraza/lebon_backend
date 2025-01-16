const express = require("express");
const {
  addItemToMenu,
  getMenuItems,
} = require("../controllers/menuController");
const validateToken = require("../middleware/validateTokenHandler");

const routes = express.Router();

routes.post("/addtomenu", validateToken ,addItemToMenu);
routes.get("/", getMenuItems);

module.exports = routes;

//...
