const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  name: String,
  price: Number,
  gst: Number,
  gstAmount: Number,
  total: Number
});

module.exports = mongoose.model("Service", serviceSchema);
