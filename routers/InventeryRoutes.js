const express = require("express");
const router = express.Router();
const cors = require("cors");

const {
  createInventoryItem,
  getAllInventoryItems,
  deleteInventoryItem,
  updateInventoryItem,
  getInventoryItemById,
  searchInventoryItems,
  totalCount,
} = require("../controllers/inventeryController");

router.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  }),
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
 *     summary: Get all inventory items with pagination
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: startindex
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Starting index of items to retrieve (0-based)
 *       - in: query
 *         name: endindex
 *         schema:
 *           type: integer
 *           default: 9
 *         description: Ending index of items to retrieve (inclusive)
 *     responses:
 *       200:
 *         description: List of inventory items with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                 startindex:
 *                   type: integer
 *                 endindex:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 data:
 *                   type: array
 *       400:
 *         description: Invalid startindex or endindex
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

/**
 * @swagger
 * /api/inventorySearch:
 *   get:
 *     summary: Search inventory items by itemName or itemNumber
 *     tags:
 *       - Inventory
 *     parameters:
 *       - in: query
 *         name: itemName
 *         schema:
 *           type: string
 *         description: Partial or full name of the item to search
 *       - in: query
 *         name: itemNumber
 *         schema:
 *           type: number
 *         description: Partial or full item number to search
 *     responses:
 *       200:
 *         description: List of matching inventory items
 *       400:
 *         description: Provide itemName or itemNumber
 *       500:
 *         description: Server Error
 */
router.get("/inventorySearch", searchInventoryItems);

/**
 * @swagger
 * /api/inventoryTotalCount:
 *   get:
 *     summary: Get total count of inventory items
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Total count of inventory items
 *       500:
 *         description: Server Error
 */
router.get("/inventoryTotalCount", totalCount);

module.exports = router;
