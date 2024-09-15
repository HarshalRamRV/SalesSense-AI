from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS  # Import the CORS package
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

app = Flask(__name__)
CORS(app) 

# Load the model and tokenizer
model_path = 'gaussalgo/T5-LM-Large-text2sql-spider'
model = AutoModelForSeq2SeqLM.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)

# Database connection function
def query_db(query):
    try:
        conn = sqlite3.connect('sales_data.db')
        cursor = conn.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        conn.close()
        return rows
    except sqlite3.Error as e:
        return str(e)

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
    "sales_date" text, 
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

    # Send response back to frontend
    return jsonify({
        'gpt_response': generated_sql,
        'sql_result': sql_result
    })

if __name__ == '__main__':
    app.run(debug=True)
