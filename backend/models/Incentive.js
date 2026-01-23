const mongoose = require("mongoose");
const incentiveSchema = new mongoose.Schema({
  front: Number,
  rear: Number,
  shock: Number
});

module.exports = mongoose.model("Incentive", incentiveSchema);
