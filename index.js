const express = require('express');
// const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require("cors");
const { errorHandler } = require("./src/middlewares");
const notFound = require("./src/controllers/notFound");

// Import routes
const authRoute = require("./src/routes/auth.js");

// Load environment variables
require('dotenv').config();

// Initialize express app
const app = express();
// Using the port from .env, with a fallback
const PORT = process.env.PORT || 3000;

// Middleware for parsing request bodies
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: false, limit: "500mb" }));

// Security and logging middleware
app.use(cors());
app.use(morgan("dev"));

// Basic route
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

// Use API routes
app.use("/api/v1/auth", authRoute);

// Handle 404 Not Found
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});