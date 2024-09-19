# routes/auth_routes.py
from flask import Blueprint, request, jsonify
import sqlite3
import bcrypt
import jwt
import os

auth_bp = Blueprint('auth', __name__)

SECRET_KEY = os.getenv('SECRET_KEY', 'your_secret_key')

# Route to handle user registration
@auth_bp.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    email = data.get('email')
    password = data.get('password')

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
        return jsonify({'error': str(e)}), 400

# Route to handle user login and generate JWT token
@auth_bp.route('/api/login', methods=['POST'])
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
