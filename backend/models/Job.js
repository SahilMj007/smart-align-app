const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    vehicle: String,
    jobCard: String,
    advisor: String,
    technician: String,

    frontBalancing: { type: Boolean, default: false },
    rearBalancing: { type: Boolean, default: false },
    shockerAlignment: { type: Boolean, default: false },

    frontPrice: { type: Number, default: 0 },
    rearPrice: { type: Number, default: 0 },
    shockerPrice: { type: Number, default: 0 },

    amountWithoutGST: Number,
    gstAmount: Number,
    totalAmount: Number,

    remarks: String,

    entryDate: String,
    entryTime: String,

  createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
},

  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
