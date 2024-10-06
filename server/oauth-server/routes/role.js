import express from 'express';
import { createRole, deleteRole, getAllRoles, getRoleById, getRolesByTerminalId, updateRole } from '../controllers/role.controller.js';
import { verifyAdmin, verifyRole, verifyRoleMod } from '../utils/verifiedToken.js';

const router = express.Router();

// Create a new role in DB
router.post('/create', verifyAdmin, createRole);

// Upadte role in DB
router.put('/update/:id', verifyRoleMod, updateRole);

// Get all roles in DB
router.get('/getAll', verifyAdmin, getAllRoles);

// Get role by ID
router.get('/:id', verifyAdmin, getRoleById);

// Delete role in DB
router.delete("/delete/:id", verifyAdmin, deleteRole);

// Get all roles in terminal
router.get('/terminal/:terminalId', verifyRoleMod, getRolesByTerminalId);





export default router;