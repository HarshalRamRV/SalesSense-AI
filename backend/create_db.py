import sqlite3

try:
    conn = sqlite3.connect('sales_data.db')
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            product_name TEXT, 
            quantity INTEGER, 
            price REAL, 
            sales_date TEXT
        )
    ''')

    sales_data = [
        ('Laptop', 5, 1000.00, '2024-09-01'),
        ('Mouse', 50, 20.00, '2024-09-02'),
        ('Keyboard', 20, 45.00, '2024-09-03'),
        ('Monitor', 10, 250.00, '2024-09-04'),
        ('Headphones', 15, 75.00, '2024-09-05')
    ]

    cursor.executemany('''
        INSERT INTO sales (product_name, quantity, price, sales_date)
        VALUES (?, ?, ?, ?)
    ''', sales_data)

    conn.commit()
    print("Sales data inserted successfully!")
except sqlite3.Error as e:
    print(f"An error occurred: {e}")
finally:
    conn.close()
