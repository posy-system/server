const express = require('express');
const router = express.Router();
const cors = require('cors');
const { getAllBills, getBillById, updateBill, deleteBill } = require('../controllers/billController');

router.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000', 'http://localhost:8000'] // allow swagger + frontend
  })
);

/**
 * @swagger
 * /bill/get-bills:
 *   get:
 *     summary: Get paginated list of bills
 *     description: Fetch a paginated list of bills from an external service or database.
 *     tags:
 *       - Bills
 *     responses:
 *       200:
 *         description: Bills fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bills fetched successfully
 *                 bills:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       billUrl:
 *                         type: string
 *                         example: https://storage.yoursite.com/bills/bill_001.pdf
 *                       salesId:
 *                         type: string
 *                         example: 65f1a2b3c4d5e6f7890a1234
 *                       billDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-01-10T10:30:00.000Z
 *                 totalBills:
 *                   type: integer
 *                   example: 25
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *       500:
 *         description: Internal server error
 */
router.get('/get-bills', getAllBills);

/**
 * @swagger
 * /bill/get-bill/{id}:
 *   get:
 *     summary: Get a bill by ID
 *     description: Fetch a single bill using its unique identifier.
 *     tags:
 *       - Bills
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the bill to retrieve
 *     responses:
 *       200:
 *         description: Bill fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 billUrl:
 *                   type: string
 *                   example: https://storage.yoursite.com/bills/bill_001.pdf
 *                 salesId:
 *                   type: string
 *                   example: 65f1a2b3c4d5e6f7890a1234
 *                 billDate:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-01-10T10:30:00.000Z
 *       404:
 *         description: Bill not found
 *       500:
 *         description: Internal server error
 */
router.get('/get-bill/:id', getBillById);

/**
 * @swagger
 * /bill/update-bill/{id}:
 *   patch:
 *     summary: Update a bill by ID
 *     description: Update a bill's details using its unique identifier.
 *     tags:
 *       - Bills
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the bill to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               billUrl:
 *                 type: string
 *                 example: https://storage.yoursite.com/bills/bill_001.pdf
 *               salesId:
 *                 type: string
 *                 example: 65f1a2b3c4d5e6f7890a1234
 *               billDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-01-10T10:30:00.000Z
 *     responses:
 *       200:
 *         description: Bill updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bill updated successfully
 *       404:
 *         description: Bill not found
 *       500:
 *         description: Internal server error
 */
router.patch('/update-bill/:id', updateBill);

/**
 * @swagger
 * /bill/delete-bill/{id}:
 *   delete:
 *     summary: Delete a bill by ID
 *     description: Deletes a bill using its unique identifier.
 *     tags:
 *       - Bills
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the bill to delete
 *     responses:
 *       200:
 *         description: Bill deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bill deleted successfully
 *       404:
 *         description: Bill not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete-bill/:id', deleteBill);

module.exports = router;
