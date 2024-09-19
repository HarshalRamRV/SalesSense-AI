# utils/db_helpers.py
import sqlite3
from datetime import datetime

# Function to execute a query and return results as JSON
def query_db(query):
    try:
        conn = sqlite3.connect('./database/sales.db')
        conn.row_factory = sqlite3.Row  # To return rows as dictionaries
        cursor = conn.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]  # Convert rows to dictionaries
    except sqlite3.Error as e:
        return str(e)

# Function to insert chat history into the database
def insert_chat_history(user_id, user_message, bot_message):
    try:
        conn = sqlite3.connect('./database/sales.db')
        cursor = conn.cursor()

        # Get the current timestamp
        timestamp = datetime.now().isoformat()

        # Insert user and bot messages into the database
        cursor.execute('''
            INSERT INTO chat_history (user_id, user_message, bot_message, timestamp)
            VALUES (?, ?, ?, ?)
        ''', (user_id, user_message, bot_message, timestamp))

        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        print(f"An error occurred while inserting chat history: {e}")
