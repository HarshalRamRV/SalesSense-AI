# routes/query_routes.py
from flask import Blueprint, request, jsonify
import sqlite3
import jwt
from datetime import datetime
from utils.db_helpers import query_db, insert_chat_history  # Import utility functions
from utils.gemini_helpers import get_gemini_sql_query, is_query_safe  # Import Gemini-related helpers
import os

query_bp = Blueprint('query', __name__)

SECRET_KEY = os.getenv('SECRET_KEY', 'your_secret_key')

# Route to handle queries from the frontend
@query_bp.route('/api/query', methods=['POST'])
def generate_sql_and_fetch_data():
    data = request.json
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

        # Check if the SQL query is trying to access restricted tables
        if not is_query_safe(generated_sql):
            return jsonify({'error': 'Access to restricted tables is not allowed'}), 403

        # Execute the generated SQL on the SQLite database
        sql_result = query_db(generated_sql)

        # Insert chat history into the database
        insert_chat_history(user_id, user_query, str(sql_result))

        # Send response back to the frontend
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
@query_bp.route('/api/chat-history', methods=['GET'])
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
        cursor.execute(
            'SELECT user_message, bot_message, timestamp FROM chat_history WHERE user_id = ? ORDER BY timestamp ASC', 
            (user_id,)
        )
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
