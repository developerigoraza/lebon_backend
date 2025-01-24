const express = require("express");
const {
  addItemToNewArrivals,
  getNewArrivalsItems,
  getNewArrivalItemById,
  editNewArrivalItem,
  deleteNewArrivalItem,
} = require("../controllers/newArrivalsController");
const validateToken = require("../middleware/validateTokenHandler");

const routes = express.Router();

routes.post("/add", validateToken, addItemToNewArrivals);
routes.get("/", getNewArrivalsItems);
routes.get("/:id", getNewArrivalItemById);
routes.put("/:id", validateToken, editNewArrivalItem);
routes.delete("/:id", validateToken, deleteNewArrivalItem);

module.exports = routes;
