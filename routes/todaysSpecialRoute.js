const express = require("express");
const {
  addItemToTodaysSpecial,
  getTodaysSpecialItems,
  getTodaysSpecialItemById,
  editTodaysSpecialItem,
  deleteTodaysSpecialItem,
} = require("../controllers/todaysSpecialController");
const validateToken = require("../middleware/validateTokenHandler");

const routes = express.Router();
routes.post("/add", validateToken, addItemToTodaysSpecial);
routes.get("/", getTodaysSpecialItems); 
routes.get("/:id", getTodaysSpecialItemById);
routes.delete("/:id", validateToken, deleteTodaysSpecialItem );
routes.put("/:id", validateToken, editTodaysSpecialItem );

module.exports = routes;
