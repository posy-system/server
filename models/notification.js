const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["INFO", "WARNING", "SUCCESS", "ERROR"],
      default: "INFO",
    },
    viewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
