# SalesSense-AI: Customer Support Chatbot for Retail Analytics

## Overview
This project is a fully functional customer support chatbot designed to integrate with a retail analytics platform. It enables users to interact with the chatbot to query sales data and receive insights. The chatbot utilizes a Large Language Model (LLM) for natural language understanding and interacts with a SQL database for structured data retrieval.

## Features
- **User-Friendly Web Interface**: Responsive design for both desktop and mobile devices with chat history, typing indicators, and a minimalistic design.
- **Express.js Backend**: RESTful API built with Express.js for efficient request handling, middleware support, and robust error handling.
- **SQL Database Management**: Stores sales data, product information, and customer queries with optimized SQL queries.
- **RESTful API**: Provides endpoints for querying sales data, retrieving chat history, and interacting with the LLM.
- **Google Gemini Integration**: Leverages Gemini 1.5 Flash for fast, accurate natural language understanding and SQL query generation.

## Technical Stack
- Frontend: React + Vite
- Backend: Express.js
- Database: SQLite
- LLM: Google Gemini 1.5 Flash
- API: RESTful architecture

## Installation

### Prerequisites
- Node.js and npm (for frontend and backend)
- Python 3.x (for database setup)
- SQLite (for database)
- Google Cloud API key (for Gemini access)
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


