from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure Google Gemini API
genai.configure(api_key='AIzaSyBxxLjQUNWm1axTxk6g2nIXT2a_KdYtHoQ')

app = Flask(__name__)
CORS(app)

# Database schema for sales table
SCHEMA = """
Table: sales
Columns:
- id (int, primary key)
- product_name (text)
- quantity (int)
- price (real)
- sales_date (date)
"""

# Function to execute a query and return results as JSON
def query_db(query):
    try:
        conn = sqlite3.connect('../database/sales.db')
        conn.row_factory = sqlite3.Row  # To return rows as dictionaries
        cursor = conn.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]  # Convert rows to dictionaries
    except sqlite3.Error as e:
        return str(e)

# Function to insert chat history into the database
def insert_chat_history(user_message, bot_message):
    try:
        conn = sqlite3.connect('../database/sales.db')
        cursor = conn.cursor()
        
        # Get the current timestamp
        timestamp = datetime.now().isoformat()
        
        # Insert user and bot messages into the database
        cursor.execute('''
            INSERT INTO chat_history (user_message, bot_message, timestamp)
            VALUES (?, ?, ?)
        ''', (user_message, bot_message, timestamp))
        
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        print(f"An error occurred while inserting chat history: {e}")

# Function to get SQL query from Google Gemini using model gemini-1.5-flash
import re

# Function to get SQL query from Google Gemini using model gemini-1.5-flash
def get_gemini_sql_query(user_query):
    prompt = f"""
    You are an expert in converting English questions to SQL query!
    The SQL database has the following structure:
    {SCHEMA}

    For example:
    1. How many sales were made today?
       SQL: SELECT COUNT(*) FROM sales WHERE sales_date = CURRENT_DATE;

    2. What is the total revenue from sales?
       SQL: SELECT SUM(price * quantity) FROM sales;

    Now generate the SQL query based on the following question:
    {user_query}
    """

    # Generating SQL query using Google Gemini 'gemini-1.5-flash'
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content([prompt])
    generated_sql = response.text.strip()

    # Clean up the generated SQL to remove unwanted characters or formatting
    cleaned_sql = re.sub(r'```sql|```', '', generated_sql).strip()

    return cleaned_sql

# Route to handle queries from frontend
@app.route('/api/query', methods=['POST'])
def generate_sql_and_fetch_data():
    data = request.json
    user_query = data.get('query')

    if not user_query:
        return jsonify({'error': 'Query is missing'}), 400

    # Get the SQL query from Google Gemini
    generated_sql = get_gemini_sql_query(user_query)

    # Execute the generated SQL on the SQLite database
    sql_result = query_db(generated_sql)

    # Insert chat history into the database
    insert_chat_history(user_query, str(sql_result))

    # Send response back to frontend
    return jsonify({
        'generated_sql': generated_sql,
        'sql_result': sql_result
    })

# Route to retrieve chat history
@app.route('/api/chat-history', methods=['GET'])
def get_chat_history():
    try:
        conn = sqlite3.connect('../database/sales.db')
        cursor = conn.cursor()
        cursor.execute('SELECT user_message, bot_message, timestamp FROM chat_history ORDER BY timestamp ASC')
        history = cursor.fetchall()
        conn.close()

        chat_history = [
            {'user_message': row[0], 'bot_message': row[1], 'timestamp': row[2]}
            for row in history
        ]

        return jsonify(chat_history)
    except sqlite3.Error as e:
        return jsonify({'error': f"An error occurred while fetching chat history: {e}"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
