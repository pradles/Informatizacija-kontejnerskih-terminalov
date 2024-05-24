import express from 'express';

import { verifyRole } from '../utils/verifiedToken.js';
import { createStorageRecord, getAllStorageRecords, getStorageRecordsById, getTerminalStorageRecords } from '../controllers/storage.controller.js';

const router = express.Router();

// Create storage record
router.post('/create', verifyRole, createStorageRecord);

// Get all storage records
router.get('/', verifyRole, getAllStorageRecords);

// Get terminal storage records
router.get('/terminal/:id', verifyRole, getTerminalStorageRecords);

// Get terminal storage by id
router.get('/:id', verifyRole, getStorageRecordsById);


export default router;