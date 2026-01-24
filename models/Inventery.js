const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    itemNumber: {
      type: Number,
      required: true,
      default: 0,
    },
    otherPrice: {
      type: Number,
      required: true,
    },
    ourPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    available: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Inventory", inventorySchema);
