import express from 'express';
import { getAllUsers, getUserById, getUserTerminals, updateUser } from '../controllers/user.controller.js';
import { verifyAdmin, verifyUser } from '../utils/verifiedToken.js';

const router = express.Router();

// Get all users
router.get('/', verifyAdmin, getAllUsers);

// Get user by id
router.get('/:id', verifyUser, getUserById);

// Get user terminals by id
router.get('/terminal/:id', verifyUser, getUserTerminals);

// Update user
router.put('/update', verifyAdmin, updateUser);



export default router;