const express = require("express");
require("./config/db");
const routes = require("./routes/routes");

const app = express();

app.use(express.json());
app.use("/api", routes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is listening at ${PORT}`);
});
