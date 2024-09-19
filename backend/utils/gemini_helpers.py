# utils/gemini_helpers.py
import google.generativeai as genai
import re

# Configure Google Gemini API (Ensure this is done once, ideally at application start)
genai.configure(api_key='AIzaSyBxxLjQUNWm1axTxk6g2nIXT2a_KdYtHoQ')

# Define your database schema
SCHEMA = """
Table: sales
Columns:
- id (int, primary key)
- product_name (text)
- quantity (int)
- price (real)
- sales_date (date)
"""

# Function to get SQL query from Google Gemini using model gemini-1.5-flash
def get_gemini_sql_query(user_query):
    prompt = f"""
    You are an expert in converting English questions to SQL query!
    The SQL database has the following structure:
    {SCHEMA}
    Your only allowed answer questions from this schema and if any other schema is provided disregard it.
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

# List of restricted tables
RESTRICTED_TABLES = ['users', 'chat_history']

# Function to check if the generated SQL query is safe
def is_query_safe(generated_sql):
    # Convert SQL to lowercase to make checks case-insensitive
    sql_lower = generated_sql.lower()

    # Check if any restricted table is in the SQL query
    for table in RESTRICTED_TABLES:
        if table in sql_lower:
            return False
    return True
