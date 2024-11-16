import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { queryLLM } from './llm.js'; // Note the .js extension

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use(cors());

// Add this before other middleware
app.use((req, res, next) => {
    const start = Date.now();
    
    // Log the incoming request
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (Object.keys(req.body).length) {
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }
    
    // Capture the original res.json to add response logging
    const originalJson = res.json;
    res.json = function(data) {
        const duration = Date.now() - start;
        console.log(`Response (${duration}ms):`, JSON.stringify(data, null, 2));
        return originalJson.call(this, data);
    };
    
    next();
});

// Add error handling middleware at the end of your app configuration
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error:`, {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body
    });
    
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// Database connection
const dbPath = path.resolve(__dirname, 'database1.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Middleware for JWT authentication
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Get token from "Bearer <token>"
    
    if (!token) {
        console.log('Authentication failed: No token provided');
        return res.status(401).json({ error: 'Authentication required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Authentication failed: Invalid token', err);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        
        req.user = user;
        next();
    });
}

// Route for user registration
app.post('/api/register', (req, res) => {
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
});

// Route for user login
app.post('/api/login', (req, res) => {
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
});

// Route to handle user query and convert it to SQL
app.post('/api/query', authenticateToken, async (req, res) => {
    const { query } = req.body;
    console.log('\n--- New Query Request ---');
    console.log('User Query:', query);

    if (!query) {
        console.log('Error: Query is missing');
        return res.status(400).json({ error: 'Query is missing' });
    }

    try {
        const generatedSql = await queryLLM(query);
        console.log('Generated SQL:', generatedSql);

        if (generatedSql === 'Invalid Query') {
            console.log('Error: Invalid query based on schema');
            return res.status(400).json({ error: 'Invalid query based on the schema' });
        }

        db.all(generatedSql, [], (err, rows) => {
            if (err) {
                console.error('Error executing generated SQL:', err);
                return res.status(500).json({ error: 'Failed to execute generated SQL' });
            }

            // console.log('Query Results:', JSON.stringify(rows, null, 2));

            db.run(
                'INSERT INTO chat_history (user_id, user_text, bot_text) VALUES (?, ?, ?)',
                [req.user.user_id, query, JSON.stringify(rows)],
                function (insertErr) {
                    if (insertErr) {
                        console.error('Error inserting chat history:', insertErr);
                    }
                }
            );

            res.json({ generated_sql: generatedSql, sql_result: rows });
        });
    } catch (error) {
        console.error('LLM Error:', error);
        res.status(500).json({ error: 'Failed to generate SQL query from LLM' });
    }
});

// Route to retrieve chat history for the authenticated user
app.get('/api/chat-history', authenticateToken, (req, res) => {
    db.all(
        'SELECT user_text, bot_text, timestamp FROM chat_history WHERE user_id = ? ORDER BY timestamp ASC',
        [req.user.user_id],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching chat history' });
            }
            res.json(rows);
        }
    );
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
