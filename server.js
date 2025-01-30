const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoose = require("mongoose");
const connectDb = require("./db");

const adminRoutes = require("./routes/adminRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const subCategoryRoutes = require("./routes/subCategoryRoutes");

const app = express();
dotenv.config();
const path = require("path");
connectDb();

const PORT = process.env.PORT || 3000;

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

app.use("/api/categories/", categoryRoutes);
app.use("/api/subcategories/", subCategoryRoutes);
app.use("/api/products/", productRoutes);
app.use("/api/admin/", adminRoutes);
app.use("/api/gallery/", galleryRoutes);
// app.use("/api/customer/", customerRoutes);
// app.use("api/cart", cartRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
