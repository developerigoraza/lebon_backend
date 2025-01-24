const express = require("express");
const {
  addItemToSpecial,
  getSpecialItems,
  getSpecialItemById,
  editSpecialItem,
  deleteSpecialItem,
} = require("../controllers/todaysSpecialController");
const validateToken = require("../middleware/validateTokenHandler");

const routes = express.Router();
routes.post("/add", validateToken, addItemToSpecial);
routes.get("/", getSpecialItems);
routes.get("/:id", getSpecialItemById);
routes.delete("/:id", validateToken, deleteSpecialItem);
routes.put("/:id", validateToken, editSpecialItem);

module.exports = routes;
