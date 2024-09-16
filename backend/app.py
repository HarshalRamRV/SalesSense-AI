from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

app = Flask(__name__)
CORS(app)

# Load the model and tokenizer
model_path = 'gaussalgo/T5-LM-Large-text2sql-spider'
model = AutoModelForSeq2SeqLM.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)

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
import sqlite3
from datetime import datetime

def insert_chat_history(user_message, bot_message):
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect('../database/sales.db')
        cursor = conn.cursor()
        
        # Get the current timestamp
        timestamp = datetime.now().isoformat()
        
        # Execute the INSERT command with the timestamp
        cursor.execute('''
            INSERT INTO chat_history (user_message, bot_message, timestamp)
            VALUES (?, ?, ?)
        ''', (user_message, bot_message, timestamp))
        
        # Commit the transaction and close the connection
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        print(f"An error occurred while inserting chat history: {e}")



# Route to handle queries from frontend
@app.route('/api/query', methods=['POST'])
def generate_sql_and_fetch_data():
    data = request.json
    user_query = data.get('query')

    if not user_query:
        return jsonify({'error': 'Query is missing'}), 400

    # Define the schema
    schema = """
    "sales" 
    "id" int, 
    "product_name" text, 
    "quantity" int, 
    "price" real, 
    "sales_date" date, 
    primary key: "id"
    """

    # Create input text for the model
    input_text = f"Question: {user_query} Schema: {schema}"

    # Tokenize and generate SQL query
    model_inputs = tokenizer(input_text, return_tensors="pt")
    outputs = model.generate(**model_inputs, max_length=512)
    generated_sql = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]

    # Execute the generated SQL on the SQLite database
    sql_result = query_db(generated_sql)

    # Insert chat history into the database
    insert_chat_history(user_query, str(sql_result))  # Store result as string

    # Send response back to frontend
    return jsonify({
        'sql_result': sql_result
    })

# Route to retrieve chat history
# Route to retrieve chat history
@app.route('/api/chat-history', methods=['GET'])
def get_chat_history():
    try:
        conn = sqlite3.connect('../database/sales.db')
        cursor = conn.cursor()
        cursor.execute('SELECT user_message, bot_message, timestamp FROM chat_history ORDER BY timestamp ASC')
        history = cursor.fetchall()
        conn.close()

        # Format the history for JSON response
        chat_history = [
            {'user_message': row[0], 'bot_message': row[1], 'timestamp': row[2]}
            for row in history
        ]

        return jsonify(chat_history)
    except sqlite3.Error as e:
        return jsonify({'error': f"An error occurred while fetching chat history: {e}"})

if __name__ == '__main__':
    app.run(debug=True)
