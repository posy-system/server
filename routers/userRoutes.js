const express = require("express");
const router = express.Router();
const cors = require("cors");
const {
  Createuser,
  getuser,
  resetpassword,
} = require("../controllers/userController");
const { swaggerUi } = require("../swagger");
router.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  }),
);

/**
 * @swagger
 * /user/createuser:
 *   post:
 *     summary: Create a new user
 *     tags: [User]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
router.post("/createuser", Createuser);

/**
 * @swagger
 * /user/getuser:
 *   get:
 *     summary: Get current logged in user data
 *     tags: [User]
 *     description: Requires authentication cookie (token)
 *     responses:
 *       200:
 *         description: Returns user data (without password)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublic'
 *       401:
 *         description: No token or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
router.get("/getuser", getuser);

/**
 * @swagger
 * /user/resetpassword:
 *   patch:
 *     summary: Reset user password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       404:
 *         description: User not found
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
router.patch("/resetpassword", resetpassword);

module.exports = router;
