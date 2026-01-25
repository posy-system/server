require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { swaggerUi, specs } = require("./swagger");

const app = express();

console.log("MongoDB URL:", process.env.MONGO_URL);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Database not connected", err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
console.log("Swagger docs available at: http://localhost:8000/api-docs");

// Routes
app.use("/auth", require("./routers/authRoutes"));
app.use("/user", require("./routers/userRoutes"));
app.use("/bill", require("./routers/billRoutes"));
app.use("/api", require("./routers/InventeryRoutes"));
app.use("/sales", require("./routers/salesRoutes"));

const port = 8000;

// Starting the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;