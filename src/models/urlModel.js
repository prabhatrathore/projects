const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
    urlCode: { type: String, required: true, lowercase: true, trim: true },
    longUrl: { type: String, required: true, trim: true },
    shortUrl: { type: String, required: true, uniques: true },
  
}, { timestamps: true }
);
function ValidURL(str) {
    var regex = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    if(!regex .test(str)) {
      alert("Please enter valid URL.");
      return false;
    } else {
      return true;
    }
  }

module.exports = mongoose.model("url", urlSchema);