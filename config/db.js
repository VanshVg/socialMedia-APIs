const mongoose = require("mongoose");

let url =
  "mongodb+srv://vanshvg:Vansh1712@socialmedia.xqmcctb.mongodb.net/?retryWrites=true&w=majority";

module.exports = mongoose.connect(url);
