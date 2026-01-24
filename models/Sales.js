const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema(
  {
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        priceAtSale: {
          type: Number,
          required: true,
        },
      },
    ],
    fullBill: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    saleDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Sales", salesSchema);
