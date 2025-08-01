const express = require("express");
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password/:token', resetPassword);

module.exports = router;
