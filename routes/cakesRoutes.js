const express = require("express");
const {
  addItemToCakes,
  getCakesItems,
  getCakeItemById,
  editCakeItem,
  deleteCakeItem,
} = require("../controllers/cakesController");
const validateToken = require("../middleware/validateTokenHandler");

const routes = express.Router();

routes.post("/add", validateToken, addItemToCakes);
routes.get("/", getCakesItems);
routes.get("/:id", getCakeItemById);
routes.put("/:id", validateToken, editCakeItem);
routes.delete("/:id", validateToken, deleteCakeItem);

module.exports = routes;
