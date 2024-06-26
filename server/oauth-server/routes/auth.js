import express from 'express';
import { getUserAccessNumbers, login, register, registerAdmin, resetPassword, sendEmail } from '../controllers/auth.controller.js';
import { verifyAdmin, verifyUser } from '../utils/verifiedToken.js';

const router = express.Router();

// Register user on DB
router.post("/register", verifyAdmin, register);

// Login
router.post("/login", login);

// Register as admin
router.post("/register-admin", verifyAdmin, registerAdmin);

// Send reset email
router.post("/send-email", sendEmail);

// Reset password
router.post("/reset-password", resetPassword);

// Get access numbers
router.get("/get-access-numbers/:id", verifyUser, getUserAccessNumbers);

export default router;