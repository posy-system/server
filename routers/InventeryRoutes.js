const express = require("express");
const router = express.Router();
const cors = require("cors");

const {
  createInventoryItem,
  getAllInventoryItems,
  deleteInventoryItem,
  updateInventoryItem,
  getInventoryItemById,
} = require("../controllers/inventeryController");

router.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management APIs
 */

/**
 * @swagger
 * /api/inventoryAdd:
 *   post:
 *     summary: Create a new inventory item
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemName
 *               - itemNumber
 *               - quantity
 *             properties:
 *               itemName:
 *                 type: string
 *               itemNumber:
 *                 type: number
 *               otherPrice:
 *                 type: number
 *               ourPrice:
 *                 type: number
 *               quantity:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 */
router.post("/inventoryAdd", createInventoryItem);

/**
 * @swagger
 * /api/inventoryGetall:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: List of inventory items
 */
router.get("/inventoryGetall", getAllInventoryItems);

/**
 * @swagger
 * /api/inventoryGetById/{id}:
 *   get:
 *     summary: Get inventory item by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory item data
 *       404:
 *         description: Item not found
 */
router.get("/inventoryGetById/:id", getInventoryItemById);

/**
 * @swagger
 * /api/inventoryUpdate/{id}:
 *   patch:
 *     summary: Update inventory item
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Inventory item updated
 */
router.patch("/inventoryUpdate/:id", updateInventoryItem);

/**
 * @swagger
 * /api/inventoryDelete/{id}:
 *   delete:
 *     summary: Delete inventory item
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory item deleted
 */
router.delete("/inventoryDelete/:id", deleteInventoryItem);

module.exports = router;
