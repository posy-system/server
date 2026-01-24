require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { swaggerUi, specs } = require("./swagger");

const app = express();

console.log("MongoDB URL:", process.env.MONGO_URL); // Debug line to check if the URL is correctly loaded

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Database not connected", err));

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(cookieParser());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
console.log("http://localhost:8000/api-docs")

//router
app.use("/auth", require("./routers/authRoutes"));
app.use("/user", require("./routers/userRoutes"));

const port = 8000;

// Starting the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
