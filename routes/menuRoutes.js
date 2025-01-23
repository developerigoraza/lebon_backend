const express = require("express");
const {
  addItemToMenu,
  getMenuItems,
  getItemById,
  deleteMenuItem,
  editMenuItem
} = require("../controllers/menuController");
const validateToken = require("../middleware/validateTokenHandler");

const routes = express.Router();


routes.post("/addtomenu", validateToken, addItemToMenu);
routes.get("/:id", getItemById); 
routes.get("/", getMenuItems);
routes.delete("/:id", validateToken, deleteMenuItem);
routes.put("/:id", validateToken, editMenuItem); 

module.exports = routes;
