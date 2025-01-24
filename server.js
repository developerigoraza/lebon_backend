const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoose = require("mongoose");
const connectDb = require("./db");
dotenv.config();
const menuRoutes = require("./routes/menuRoutes");
const adminRoutes = require("./routes/adminRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const newArrivalsRoutes = require("./routes/newArrivalsRoute");
const pastriesRoutes = require("./routes/pastriesRoutes");
const cakesRoutes = require("./routes/cakesRoutes");
const todaysSpecialRoutes = require("./routes/todaysSpecialRoute");

const path = require("path");
// const customerRoutes = require("./routes/customerRoutes");
// const cartRoutes = require("./routes/cartRoutes");

const app = express();
const PORT = process.env.PORT || 3000;
connectDb();

// app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

//test
app.get("/test", (req, res) => {
  try {
    res.status(200).json({ message: "Server is running" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.use("/new-arrivals", newArrivalsRoutes);
app.use("/pastries", pastriesRoutes);
app.use("/cakes", cakesRoutes);
app.use("/todays-special", todaysSpecialRoutes);

app.use("/api/menu/", menuRoutes);
app.use("/api/admin/", adminRoutes);
app.use("/api/gallery/", galleryRoutes);
// app.use("/api/customer/", customerRoutes);
// app.use("api/cart", cartRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
