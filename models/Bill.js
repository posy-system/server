const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    billUrl: {
      type: String,
      required: true,
    },
    salesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sales",
      required: true,
    },
    billDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Bill", billSchema);
