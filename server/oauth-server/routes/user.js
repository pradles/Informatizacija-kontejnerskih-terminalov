import express from 'express';
import { getAllUsers, getUserById } from '../controllers/user.controller.js';
import { verifyAdmin, verifyUser } from '../utils/verifiedToken.js';

const router = express.Router();

// Get all users
router.get('/', verifyAdmin, getAllUsers);

// Get user by id
router.get('/:id', verifyUser, getUserById);

export default router;