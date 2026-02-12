const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Apex Sports Backend Running");
});

app.use("/api/hello", require("./routes/hello"));
app.use("/api/images", require("./routes/images"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
