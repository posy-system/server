const express = require("express");
const router = express.Router();
const cors = require("cors");
const {
  getAllBills,
  getBill,
  deleteBill,
  updateBill,
} = require("../controllers/billController");

router.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  }),
);

/**
 * @swagger
 * /all-bills:
 *   get:
 *     summary: Get all bills with pagination
 *     tags: [Bills]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of bills per page
 *     responses:
 *       200:
 *         description: Bills fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BillsResponse'
 *       404:
 *         description: No bills found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
router.get("/all-bills", getAllBills);

/**
 * @swagger
 * /bill/get-bill/{id}:
 *   get:
 *     summary: Get a bill by ID
 *     tags: [Bills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The bill ID
 *     responses:
 *       200:
 *         description: Bill fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BillResponse'
 *       404:
 *         description: Bill not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
router.get("/get-bill/:id", getBill);

/**
 * @swagger
 * /bill/delete-bill/{id}:
 *   delete:
 *     summary: Delete a bill by ID
 *     tags: [Bills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The bill ID
 *     responses:
 *       200:
 *         description: Bill deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BillResponse'
 *       404:
 *         description: Bill not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
router.delete("/delete-bill/:id", deleteBill);

/**
 * @swagger
 * /bill/update-bill/{id}:
 *   put:
 *     summary: Update a bill by ID
 *     tags: [Bills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The bill ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBillRequest'
 *     responses:
 *       200:
 *         description: Bill updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BillResponse'
 *       404:
 *         description: Bill not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
router.put("/update-bill/:id", updateBill);

module.exports = router;
