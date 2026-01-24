const express = require('express');
const router = express.Router();
const cors = require('cors');
const { loginUser} = require('../controllers/authController');


router.use(
    cors({
        credentials: true,
        origin: 'http://localhost:3000'
    })
);

/**
 * @swagger
 * /auth/loginuser:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful, i will fuck you! returns token and user data (also sets cookie)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
router.post('/loginuser', loginUser);


module.exports = router