import express from 'express';

import { verifyAdmin, verifyRole, verifyUser } from '../utils/verifiedToken.js';
import { addOwner, deleteOwner, getAllOwners, getOwnerById, updateOwner } from '../controllers/owner.controller.js';

const router = express.Router();

// Add container
router.post('/add', verifyRole, addOwner);

// Update container
router.put('/update/:id', verifyRole, updateOwner);

// Get all containers
router.get('/', verifyRole, getAllOwners);

// Get container by id
router.get('/:id', verifyRole, getOwnerById);

// Delete Owner by Id
router.delete('/delete/:id', verifyAdmin, deleteOwner);


export default router;