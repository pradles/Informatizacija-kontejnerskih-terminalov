import express from 'express';
import { createRole, deleteRole, getAllRoles, getRoleById, updateRole } from '../controllers/role.controller.js';
import { verifyAdmin } from '../utils/verifiedToken.js';

const router = express.Router();

// Create a new role in DB
router.post('/create', verifyAdmin, createRole);

// Upadte role in DB
router.put('/update/:id', verifyAdmin, updateRole);

// Get all roles in DB
router.get('/getAll', verifyAdmin, getAllRoles);

// Get role by ID
router.get('/:id', verifyAdmin, getRoleById);

// Delete role in DB
router.delete("/deleteRole/:id", verifyAdmin, deleteRole);




export default router;