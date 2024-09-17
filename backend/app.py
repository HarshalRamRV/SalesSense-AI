from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
from datetime import datetime
import jwt
import bcrypt
import re

# Load environment variables
load_dotenv()

# Configure Google Gemini API
genai.configure(api_key='AIzaSyBxxLjQUNWm1axTxk6g2nIXT2a_KdYtHoQ')
SECRET_KEY = os.getenv('SECRET_KEY', 'your_secret_key')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins

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

# Route to handle user registration
@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    print('Received data:', data)  # Debugging line

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    try:
        conn = sqlite3.connect('./database/sales.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (email, password)
            VALUES (?, ?)
        ''', (email, hashed_password.decode('utf-8')))
        conn.commit()
        conn.close()
        return jsonify({'message': 'User registered successfully'})
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")  # Debugging line
        return jsonify({'error': str(e)}), 400

# Route to handle user login and generate JWT token
@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    try:
        conn = sqlite3.connect('./database/sales.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id, password FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()

        if user and bcrypt.checkpw(password.encode('utf-8'), user[1].encode('utf-8')):
            token = jwt.encode({'user_id': user[0]}, SECRET_KEY, algorithm='HS256')
            return jsonify({'token': token})
        else:
            return jsonify({'error': 'Invalid email or password'}), 401
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 400

# Route to handle queries from frontend
@app.route('/api/query', methods=['POST'])
def generate_sql_and_fetch_data():
    data = request.json
    print('Received data:', data)  # Debugging line
    token = data.get('token')
    user_query = data.get('query')

    if not token or not user_query:
        return jsonify({'error': 'Token or query is missing'}), 400

    try:
        # Decode the token to get user_id
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = decoded_token['user_id']

        # Get the SQL query from Google Gemini
        generated_sql = get_gemini_sql_query(user_query)
        print(f"Generated SQL Query: {generated_sql}")  # Debugging line

        # Execute the generated SQL on the SQLite database
        sql_result = query_db(generated_sql)

        # Insert chat history into the database
        insert_chat_history(user_id, user_query, str(sql_result))

        # Send response back to frontend
        return jsonify({
            'generated_sql': generated_sql,
            'sql_result': sql_result
        })
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401
    except sqlite3.Error as e:
        return jsonify({'error': f"Database error: {e}"}), 500
    except Exception as e:
        return jsonify({'error': f"An unexpected error occurred: {e}"}), 500

# Route to retrieve chat history for a specific user
@app.route('/api/chat-history', methods=['GET'])
def get_chat_history():
    token = request.args.get('token')  # Fetch token from query parameters

    if not token:
        return jsonify({'error': 'Token is missing'}), 400

    try:
        # Decode the token to get user_id
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = decoded_token['user_id']

        conn = sqlite3.connect('./database/sales.db')
        cursor = conn.cursor()
        cursor.execute('SELECT user_message, bot_message, timestamp FROM chat_history WHERE user_id = ? ORDER BY timestamp ASC', (user_id,))
        history = cursor.fetchall()
        conn.close()

        chat_history = [
            {'user_message': row[0], 'bot_message': row[1], 'timestamp': row[2]}
            for row in history
        ]

        return jsonify(chat_history)
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401
    except sqlite3.Error as e:
        return jsonify({'error': f"An error occurred while fetching chat history: {e}"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
