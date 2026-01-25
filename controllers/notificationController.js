const Notification = require("../models/notification");

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { subject, message, type } = req.body;

    if (!subject || !message) {
      return res
        .status(400)
        .json({ error: "subject and message are required" });
    }

    const newNotification = new Notification({
      subject,
      message,
      type,
      viewed: false,
    });

    await newNotification.save();

    res.status(201).json({
      message: "Notification created successfully",
      notification: newNotification,
    });
  } catch (error) {
    console.error("Create Notification Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Get all notifications with pagination
const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const notifications = await Notification.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalNotifications = await Notification.countDocuments();

    res.status(200).json({
      page,
      limit,
      totalNotifications,
      totalPages: Math.ceil(totalNotifications / limit),
      data: notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Mark a notification as viewed
const viewNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notificationItem = await Notification.findById(id);
    if (!notificationItem) {
      return res.status(404).json({ error: "Notification not found" });
    }

    notificationItem.viewed = true;
    await notificationItem.save();

    res.status(200).json({
      message: "Notification marked as viewed",
      notification: notificationItem,
    });
  } catch (error) {
    console.error("View Notification Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Delete a notification by ID
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notificationItem = await Notification.findByIdAndDelete(id);
    if (!notificationItem) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({
      message: "Notification deleted successfully",
      notification: notificationItem,
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  viewNotification,
  deleteNotification,
};
