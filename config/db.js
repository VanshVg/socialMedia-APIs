const mongoose = require("mongoose");

// let url =
//   "mongodb+srv://vanshvg:Vansh1712@socialmedia.xqmcctb.mongodb.net/?retryWrites=true&w=majority";

let url = "mongodb://127.0.0.1:27017/socialMedia";

module.exports = mongoose.connect(url);
