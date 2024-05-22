import express from 'express';

import { verifyRole } from '../utils/verifiedToken.js';
import { createStorageRecord, getAllStorageRecords, getTerminalStorageRecords } from '../controllers/storage.controller.js';

const router = express.Router();

// Create storage record
router.post('/create', verifyRole, createStorageRecord);

// Get all storage records
router.get('/', verifyRole, getAllStorageRecords);

// Get terminal storage records
router.get('/terminal/:id', verifyRole, getTerminalStorageRecords);



export default router;