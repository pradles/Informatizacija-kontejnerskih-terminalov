import express from 'express';
import { deleteUser, getAllUsers, getUserById, getUsersByTerminalId, getUserTerminals, updateUser } from '../controllers/user.controller.js';
import { verifyAdmin, verifyRoleMod, verifyUser } from '../utils/verifiedToken.js';

const router = express.Router();

// Get all users
router.get('/', verifyAdmin, getAllUsers);

// Get user by id
router.get('/:id', verifyUser, getUserById);

// Get user terminals by id
router.get('/terminal/:id', verifyUser, getUserTerminals);

// Update user
router.put('/update', verifyAdmin, updateUser);

// Route to get users by terminal ID
router.get('/by-terminal/:terminalId', verifyRoleMod, getUsersByTerminalId);

// Delete User by Id
router.delete('/delete/:id', verifyAdmin, deleteUser);

export default router;