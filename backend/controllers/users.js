import bcrypt from 'bcrypt';
import db from '../database/database.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], function (err) {
        if (err) {
            console.error('Error registering user:', err);
            return res.status(400).json({ error: 'User registration failed. Email might be taken.' });
        }
        res.json({ message: 'User registered successfully' });
    });
}

export const loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get('SELECT id, password FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ user_id: user.id }, JWT_SECRET, { algorithm: 'HS256' });
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    });
}