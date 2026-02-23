const express = require("express");
const cors = require("cors");

const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/hello", require("./routes/hello"));
app.use("/api/images", require("./routes/images"));
app.use("/api/live", require("./routes/live"));
app.use("/api/match", require("./routes/match"));

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Backend API is running..." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
