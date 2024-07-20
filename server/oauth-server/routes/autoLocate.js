import express from 'express';

import { verifyAdmin, verifyRole, verifyUser } from '../utils/verifiedToken.js';
import { autoLocate } from '../controllers/autoLocate.controller.js';

const router = express.Router();

// Auto locate best position
router.post('/', verifyRole, autoLocate);

export default router;