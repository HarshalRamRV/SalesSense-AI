
import express from 'express';
const router = express.Router();
import { registerUser } from '../controllers/users.js';
import { loginUser } from '../controllers/users.js';
// Route for user registration
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser);

export default router;
