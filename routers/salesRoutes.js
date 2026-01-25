const express = require("express");
const router = express.Router();
const {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
  getSalesStats,
  getSalesByDateRange,
} = require("../controllers/salesController");

/**
 * @swagger
 * components:
 *   schemas:
 *     SaleItem:
 *       type: object
 *       required:
 *         - itemNumber
 *         - itemName
 *         - quantity
 *         - priceAtSale
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID for the sale item
 *         itemNumber:
 *           type: string
 *           description: The item number/identifier
 *           example: "ITM-001"
 *         itemName:
 *           type: string
 *           description: The name of the item
 *           example: "Tin Can"
 *         quantity:
 *           type: number
 *           description: Quantity sold
 *           minimum: 1
 *           example: 10
 *         priceAtSale:
 *           type: number
 *           description: Price at which item was sold
 *           minimum: 0
 *           example: 450
 *     
 *     SaleItemUpdate:
 *       type: object
 *       required:
 *         - _id
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId of the sale item to update
 *           example: "69751da8c153c99223b9d4a6"
 *         itemNumber:
 *           type: string
 *           description: New item number (optional)
 *           example: "ITM-001-A"
 *         itemName:
 *           type: string
 *           description: New item name (optional)
 *           example: "Premium Tin"
 *         quantity:
 *           type: number
 *           description: New quantity (optional)
 *           minimum: 1
 *           example: 15
 *     
 *     Sale:
 *       type: object
 *       required:
 *         - items
 *         - subtotal
 *         - totalBillAmount
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID for the sale
 *           example: "69751da8c153c99223b9d4a5"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SaleItem'
 *         subtotal:
 *           type: number
 *           description: Total bill amount before discount
 *           minimum: 0
 *           example: 5000
 *         discountPercentage:
 *           type: number
 *           description: Discount percentage applied (0-100)
 *           minimum: 0
 *           maximum: 100
 *           default: 0
 *           example: 10
 *         discountAmount:
 *           type: number
 *           description: Discount amount in currency
 *           minimum: 0
 *           default: 0
 *           example: 500
 *         totalBillAmount:
 *           type: number
 *           description: Total bill amount after discount
 *           minimum: 0
 *           example: 4500
 *         saleDate:
 *           type: string
 *           format: date-time
 *           description: Date of the sale
 *           example: "2026-01-24T19:29:44.594Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the sale was created
 *           example: "2026-01-24T19:29:44.595Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the sale was last updated
 *           example: "2026-01-24T19:29:44.595Z"
 *         __v:
 *           type: number
 *           description: Version key
 *           example: 0
 *     
 *     CreateSaleRequest:
 *       type: object
 *       required:
 *         - items
 *       properties:
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: object
 *             required:
 *               - itemNumber
 *               - itemName
 *               - quantity
 *               - priceAtSale
 *             properties:
 *               itemNumber:
 *                 type: string
 *                 example: "ITM-001"
 *               itemName:
 *                 type: string
 *                 example: "Tin Can"
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 example: 10
 *               priceAtSale:
 *                 type: number
 *                 minimum: 0
 *                 example: 450
 *         discountPercentage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           default: 0
 *           example: 10
 *     
 *     UpdateSaleRequest:
 *       type: object
 *       properties:
 *         discountPercentage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: New discount percentage
 *           example: 15
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SaleItemUpdate'
 *           description: Array of items to update
 *     
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Sales retrieved successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Sale'
 *         pagination:
 *           type: object
 *           properties:
 *             currentPage:
 *               type: number
 *               example: 1
 *             totalPages:
 *               type: number
 *               example: 5
 *             totalSales:
 *               type: number
 *               example: 50
 *             limit:
 *               type: number
 *               example: 10
 *     
 *     StatsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Sales statistics retrieved successfully"
 *         data:
 *           type: object
 *           properties:
 *             totalSales:
 *               type: number
 *               example: 50
 *             totalRevenue:
 *               type: number
 *               example: 22500
 *             totalSubtotal:
 *               type: number
 *               example: 25000
 *             totalDiscount:
 *               type: number
 *               example: 2500
 *             averageSale:
 *               type: number
 *               example: 450
 *             totalItemsSold:
 *               type: number
 *               example: 500
 *             averageDiscountPercentage:
 *               type: number
 *               example: 10
 * 
 *   parameters:
 *     saleId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         pattern: '^[0-9a-fA-F]{24}$'
 *       description: MongoDB ObjectId of the sale
 *       example: "69751da8c153c99223b9d4a5"
 *     
 *     paginationPage:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 1
 *       description: Page number for pagination
 *     
 *     paginationLimit:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 10
 *       description: Number of items per page
 *     
 *     paginationSort:
 *       in: query
 *       name: sortBy
 *       schema:
 *         type: string
 *         enum: ["createdAt", "-createdAt", "saleDate", "-saleDate", "totalBillAmount", "-totalBillAmount"]
 *         default: "-createdAt"
 *       description: Field to sort by (prefix with - for descending)
 */

/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSaleRequest'
 *           examples:
 *             example1:
 *               summary: Single item sale with 10% discount
 *               value:
 *                 items:
 *                   - itemNumber: "ITM-001"
 *                     itemName: "Tin Can"
 *                     quantity: 10
 *                     priceAtSale: 450
 *                 discountPercentage: 10
 *             example2:
 *               summary: Multiple items sale with 5% discount
 *               value:
 *                 items:
 *                   - itemNumber: "ITM-001"
 *                     itemName: "Tin Can"
 *                     quantity: 5
 *                     priceAtSale: 450
 *                   - itemNumber: "ITM-002"
 *                     itemName: "Plastic Bottle"
 *                     quantity: 8
 *                     priceAtSale: 150
 *                 discountPercentage: 5
 *     responses:
 *       201:
 *         description: Sale created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Discount percentage must be between 0 and 100"
 *       500:
 *         description: Server error
 */
router.post("/", createSale);

/**
 * @swagger
 * /sales:
 *   get:
 *     summary: Get all sales with pagination
 *     tags: [Sales]
 *     parameters:
 *       - $ref: '#/components/parameters/paginationPage'
 *       - $ref: '#/components/parameters/paginationLimit'
 *       - $ref: '#/components/parameters/paginationSort'
 *     responses:
 *       200:
 *         description: Sales retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       500:
 *         description: Server error
 */
router.get("/", getAllSales);

/**
 * @swagger
 * /sales/stats/summary:
 *   get:
 *     summary: Get sales statistics
 *     tags: [Sales]
 *     responses:
 *       200:
 *         description: Sales statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatsResponse'
 *       500:
 *         description: Server error
 */
router.get("/stats/summary", getSalesStats);

/**
 * @swagger
 * /sales/stats/date-range:
 *   get:
 *     summary: Get sales by date range
 *     tags: [Sales]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Sales by date range retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sale'
 *                 count:
 *                   type: number
 *       500:
 *         description: Server error
 */
router.get("/stats/date-range", getSalesByDateRange);

/**
 * @swagger
 * /sales/{id}:
 *   get:
 *     summary: Get sale by ID
 *     tags: [Sales]
 *     parameters:
 *       - $ref: '#/components/parameters/saleId'
 *     responses:
 *       200:
 *         description: Sale retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Sale not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getSaleById);

/**
 * @swagger
 * /sales/{id}:
 *   patch:
 *     summary: Update sale by ID
 *     description: Update sale items (itemNumber, itemName, quantity) and/or discount percentage. Items are updated by their embedded document _id.
 *     tags: [Sales]
 *     parameters:
 *       - $ref: '#/components/parameters/saleId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSaleRequest'
 *           examples:
 *             updateDiscountOnly:
 *               summary: Update discount percentage only
 *               value:
 *                 discountPercentage: 15
 *             updateSingleItem:
 *               summary: Update a single item and discount
 *               value:
 *                 items:
 *                   - _id: "69751da8c153c99223b9d4a6"
 *                     itemNumber: "ITM-001-A"
 *                     itemName: "Premium Tin"
 *                     quantity: 12
 *                 discountPercentage: 10
 *             updateMultipleItems:
 *               summary: Update multiple items
 *               value:
 *                 items:
 *                   - _id: "69751da8c153c99223b9d4a6"
 *                     itemName: "Standard Tin"
 *                     quantity: 8
 *                   - _id: "another_item_id_here"
 *                     itemNumber: "ITM-002-B"
 *                     quantity: 5
 *                 discountPercentage: 8
 *     responses:
 *       200:
 *         description: Sale updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Bad request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Each item update must include _id"
 *       404:
 *         description: Sale or item not found
 *       500:
 *         description: Server error
 */
router.patch("/:id", updateSale);

/**
 * @swagger
 * /sales/{id}:
 *   delete:
 *     summary: Delete sale by ID
 *     tags: [Sales]
 *     parameters:
 *       - $ref: '#/components/parameters/saleId'
 *     responses:
 *       200:
 *         description: Sale deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Sale not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", deleteSale);

module.exports = router;