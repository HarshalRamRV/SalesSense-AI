import sqlite3

def create_database():
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect('C:/Users/backs/self Dropbox/HARSHAL RAM R V/PC/Documents/SalesSense-AI/backend/database1.db')
        cursor = conn.cursor()

        # Enforce foreign key constraints
        cursor.execute("PRAGMA foreign_keys = ON;")

        # Create tables
        cursor.executescript('''
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_name TEXT UNIQUE NOT NULL,
                price REAL NOT NULL,
                quantity INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                user_text TEXT NOT NULL,
                bot_text TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS sales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_name TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                sales_date DATE NOT NULL
            );
        ''')

        # Insert some initial data into the products table
        cursor.execute('''
            INSERT INTO products (product_name, price, quantity) VALUES
                ('Laptop', 999.99, 10),
                ('Smartphone', 499.99, 25),
                ('Headphones', 149.99, 50)
            ON CONFLICT(product_name) DO NOTHING;
        ''')

        # Insert some initial data into the sales table with random past dates
        cursor.executescript('''
            INSERT INTO sales (product_name, quantity, price, sales_date) VALUES
                ('Laptop', 2, 1999.98, '2023-01-15'),
                ('Smartphone', 1, 499.99, '2022-11-22'),
                ('Headphones', 5, 749.95, '2023-03-05'),
                ('Laptop', 1, 999.99, '2023-02-10'),
                ('Smartphone', 3, 1499.97, '2022-12-08');
        ''')

        # Commit the changes and close the connection
        conn.commit()
        print('Database created, tables added, and initial data inserted.')
    except sqlite3.Error as e:
        print('Error creating database:', e)
    finally:
        if conn:
            conn.close()

# Run the function to create the database
create_database()

# npm 7+, extra double-dash is needed:
