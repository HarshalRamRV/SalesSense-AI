# routes/__init__.py

# Import blueprints from the respective route files
from .query_routes import query_bp
from .auth_routes import auth_bp

# Define a list of blueprints to easily manage imports in the main app
__all__ = ['query_bp', 'auth_bp']
