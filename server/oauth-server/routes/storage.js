import express from 'express';

import { verifyRole } from '../utils/verifiedToken.js';
import { createStorageRecord, exportStorageRecords, getAllStorageRecords, getStorageRecordsById, getTerminalStorageRecords, updateStorageRecord, updateStorageRecords } from '../controllers/storage.controller.js';

const router = express.Router();

// Create storage record
router.post('/create', verifyRole, createStorageRecord);

// Update storage record
router.put('/update/:id', verifyRole, updateStorageRecord);

// Update storage records and containers in array 
router.put('/update', verifyRole, updateStorageRecords);

// Get all storage records
router.get('/', verifyRole, getAllStorageRecords);

// Get terminal storage records
router.get('/terminal/:id', verifyRole, getTerminalStorageRecords);

// Get terminal storage by id
router.get('/:id', verifyRole, getStorageRecordsById);

// export container storage records and containers in array 
router.put('/export', verifyRole, exportStorageRecords);

export default router;