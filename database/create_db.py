import sqlite3

try:
    conn = sqlite3.connect('sales.db')
    cursor = conn.cursor()

    # Create table with DATE type for sales_date
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            product_name TEXT, 
            quantity INTEGER, 
            price REAL, 
            sales_date DATE
        )
    ''')

    sales_data = [
    ('Laptop', 5, 1000.00, '2024-09-01'),
    ('Mouse', 50, 20.00, '2024-09-02'),
    ('Keyboard', 20, 45.00, '2024-09-03'),
    ('Monitor', 10, 250.00, '2024-09-04'),
    ('Headphones', 15, 75.00, '2024-09-05'),
    ('Smartphone', 8, 600.00, '2024-09-06'),
    ('Tablet', 12, 350.00, '2024-09-07'),
    ('Charger', 30, 10.00, '2024-09-08'),
    ('Webcam', 25, 150.00, '2024-09-09'),
    ('Printer', 5, 200.00, '2024-09-10'),
    ('USB Drive', 50, 20.00, '2024-09-11'),
    ('Monitor Stand', 20, 35.00, '2024-09-12'),
    ('Desk Chair', 7, 120.00, '2024-09-13'),
    ('Desk Lamp', 10, 45.00, '2024-09-14'),
    ('Bluetooth Speaker', 18, 90.00, '2024-09-15'),
    ('External Hard Drive', 4, 150.00, '2024-09-16'),
    ('Gaming Mouse', 15, 80.00, '2024-09-17'),
    ('Keyboard Cover', 22, 25.00, '2024-09-18'),
    ('Cable Management', 35, 15.00, '2024-09-19'),
    ('Wireless Earbuds', 10, 130.00, '2024-09-20')
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
