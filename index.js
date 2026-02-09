import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from API!" });
});

app.get("/", (req, res) => {
  res.json({ message: "Backend API is running..." });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
