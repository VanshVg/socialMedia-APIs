const express = require("express");
require("./config/db");
const routes = require("./routes/routes");
const mongoose = require("mongoose");

mongoose.connection.once("open", function () {
  console.log("Mongodb is connected");
});
mongoose.connection.on("disconnected", function () {
  console.log("Mongodb is disconnected");
});

const app = express();

app.use(express.json());
app.use("/api", routes);

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server is listening at ${PORT}`);
});
