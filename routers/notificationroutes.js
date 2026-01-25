const express = require("express");
const router = express.Router();
const cors = require("cors");

const {
  createNotification,
  getNotifications,
  viewNotification,
  deleteNotification,
} = require("../controllers/notificationController");

// CORS middleware
router.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: Notification management APIs
 */

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a new notification
 *     tags:
 *       - Notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - message
 *             properties:
 *               subject:
 *                 type: string
 *                 example: Low Stock Alert
 *               message:
 *                 type: string
 *                 example: Item ABC is running low on stock
 *               type:
 *                 type: string
 *                 example: inventory
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/notifications", createNotification);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications (paginated)
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: List of notifications
 *       500:
 *         description: Server error
 */
router.get("/notifications", getNotifications);

/**
 * @swagger
 * /api/notifications/{id}/view:
 *   patch:
 *     summary: Mark a notification as viewed
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as viewed
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.patch("/notifications/:id/view", viewNotification);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.delete("/notifications/:id", deleteNotification);

module.exports = router;
