# app.py
from flask import Flask
from flask_cors import CORS
from routes import query_bp, auth_bp  # Import blueprints directly from the routes package

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Register blueprints
app.register_blueprint(query_bp)
app.register_blueprint(auth_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
