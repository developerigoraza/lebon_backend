const express = require("express");
const {
  addItemToPastries,
  getPastriesItems,
  getPastryItemById,
  editPastryItem,
  deletePastryItem,
} = require("../controllers/pastriesController");
const validateToken = require("../middleware/validateTokenHandler");

const routes = express.Router();
routes.post("/add", validateToken, addItemToPastries);
routes.get("/", getPastriesItems);
routes.get("/:id", getPastryItemById);
routes.put("/:id", validateToken, editPastryItem);
routes.delete("/:id", validateToken, deletePastryItem);

module.exports = routes;
