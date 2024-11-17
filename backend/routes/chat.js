import express from 'express';
import { authenticateToken } from '../middleware/jwt.js';
import { queryChat, getChatHistory } from '../controllers/chat.js';
const router = express.Router();

router.post('/query', authenticateToken, queryChat);

// Route to retrieve chat history for the authenticated user
router.get('/history', authenticateToken, getChatHistory);

export default router;