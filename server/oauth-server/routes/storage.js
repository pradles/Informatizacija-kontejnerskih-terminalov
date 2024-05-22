import express from 'express';

import { verifyAdmin, verifyRole, verifyUser } from '../utils/verifiedToken.js';
import { createStorageRecord, getAllStorageRecords, getTerminalStorageRecords } from '../controllers/storage.controller.js';

const router = express.Router();

// Create storage record
router.post('/create', verifyRole, createStorageRecord);

// Get all storage records
router.put('/', verifyRole, getAllStorageRecords);

// Get terminal storage records
router.get('/terminal/:id', verifyRole, getTerminalStorageRecords);



export default router;