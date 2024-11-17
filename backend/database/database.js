import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';    

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Database connection
const dbPath = path.resolve(__dirname, 'database1.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

export default db;
