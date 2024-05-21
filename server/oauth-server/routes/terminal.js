import express from 'express';
import { verifyAdmin, verifyRole, verifyUser } from '../utils/verifiedToken.js';
import { createTerminal, deleteTerminal, getAllTerminals, getTerminalById, updateStorage, updateTerminal } from '../controllers/terminal.controller.js';

const router = express.Router();

// Create Terminal
router.post('/create', verifyAdmin, createTerminal);

// Update Terminal
router.put('/update', verifyAdmin, updateTerminal);

// Get all Terminals
router.get('/', verifyAdmin, getAllTerminals);

// Get Terminal by Id
router.get('/:id', verifyRole, getTerminalById);

// Delete Terminal by Id
router.delete('/delete/:id', verifyAdmin, deleteTerminal);

// Update Terminal storage - user that has a role in this terminal
router.put('/update-storage', verifyRole, updateStorage)

export default router;