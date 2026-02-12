const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// A simple root route
app.get("/", (req, res) => {
  res.send("Apex Sports Backend Running");
});

// API Routes
app.use("/api/hello", require("./routes/hello"));
app.use("/api/images", require("./routes/images"));

// !!! IMPORTANT CHANGE !!!
// REMOVE the app.listen() block.
// INSTEAD, export the app for Vercel to use.
module.exports = app;