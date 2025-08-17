const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require("cors");
const {errorHandler} = require("./src/middlewares");
const notFound = require("./src/controllers/notFound");

//import routes
const authRoute=require("./src/routes/auth.js");



dotenv.config();


// Initialize express app
const app = express();
const PORT = 3000;

// Middleware to parse JSON
//body parser middleware

app.use(express.json({limit:"500mb"}));
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({limit:"500mb",extended:false}));
app.use(morgan("dev"));

// Basic route
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

// // Use routes
app.use("/api/v1/auth", authRoute);

// Handle 404 Not Found
app.use(notFound);

//error handler middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});