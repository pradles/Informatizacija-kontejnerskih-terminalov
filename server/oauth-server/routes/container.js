import express from 'express';

import { verifyAdmin, verifyRole, verifyUser } from '../utils/verifiedToken.js';
import { addContainer, getAllContainers, getContainerById, updateContainer } from '../controllers/container.controller.js';

const router = express.Router();

// Add container
router.post('/add', verifyRole, addContainer);

// Update container
router.put('/update/:id', verifyRole, updateContainer);

// Get all containers
router.get('/', verifyRole, getAllContainers);

// Get container by id
router.get('/:id', verifyRole, getContainerById);


export default router;