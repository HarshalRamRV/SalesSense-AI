# Customer Support Chatbot for Retail Analytics

## Overview
This project is a fully functional customer support chatbot designed to integrate with a retail analytics platform. It enables users to interact with the chatbot to query sales data and receive insights. The chatbot utilizes a Large Language Model (LLM) for natural language understanding and interacts with a SQL database for structured data retrieval.

## Features
- **User-Friendly Web Interface**: Responsive design for both desktop and mobile devices with chat history, typing indicators, and a minimalistic design.
- **Backend Integration**: Handles communication between the chatbot, SQL database, and the LLM.
- **SQL Database Management**: Stores sales data, product information, and customer queries with optimized SQL queries.
- **RESTful API**: Provides endpoints for querying sales data, retrieving chat history, and interacting with the LLM.
- **LLM Integration**: Uses an open-source LLM to handle natural language queries and augment responses with SQL data.

## Installation

### Prerequisites
- Node.js and npm (for frontend)
- Python 3.x (for backend)
- SQLite (for database)
- Access to a cloud platform (for deployment)

### Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend
```
Install the dependencies:
```bash
npm install
```
Start the Vite development server:
```bash
npm run dev
```
Open your browser and go to `http://localhost:5173` to view the application.
### Backend Setup
Navigate to the backend directory:
```bash
cd backend
```
Install the required Python packages:
```bash
pip install -r requirements.txt
```
Run the Flask server:
```bash
python app.py
```
### Database Setup
Navigate to the database directory:
```bash
cd database
```
Create the database and populate it with sample data:
```bash
python create_db.py
```

## Usage
Open your web browser and navigate to `http://localhost:5173` to access the chatbot interface.  
Type your queries into the input box and hit Enter or click the send button to interact with the chatbot.  
The chatbot will respond with relevant sales data and insights based on your queries.

## Contact
For any questions or support, please contact ramharshal03@gmail.com.


