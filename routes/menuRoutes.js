const express = require("express");
const {
  addItemToMenu,
  getMenuItems,
  deleteMenuItem,
  editMenuItem
} = require("../controllers/menuController");
const validateToken = require("../middleware/validateTokenHandler");

const routes = express.Router();

routes.post("/addtomenu", validateToken, addItemToMenu);
routes.get("/menu/:id". getItemById)
routes.get("/", getMenuItems);
routes.delete("/menu/edit/:id", validateToken, deleteMenuItem);
routes.put("/menu/delete/:id", validateToken, editMenuItem);

module.exports = routes;
