import { useState } from 'react';
import axios from 'axios';
import { FaPaperPlane } from 'react-icons/fa';
import './App.css';

const App = () => {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  // Function to handle sending query to the backend
  const sendQuery = async () => {
    if (!query) return;

    // Append user message to the chat history
    const newMessage = { type: 'user', text: query };
    setChatHistory([...chatHistory, newMessage]);

    try {
      // Send the query to the backend
      const response = await axios.post('http://localhost:5000/api/query', { query });

      // Check for errors in the response
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Destructure the response data
      const { gpt_response, sql_result } = response.data;

      // Prepare messages for the chat history
      const gptMessage = { type: 'bot', text: gpt_response || 'No response from GPT-Neo' };
      const sqlMessages = sql_result
        ? [{ type: 'bot', text: `SQL Result:\n${JSON.stringify(sql_result, null, 2)}` }]
        : [];

      // Update the chat history with the new messages
      setChatHistory([...chatHistory, newMessage, gptMessage, ...sqlMessages]);

    } catch (error) {
      console.error('Error fetching response from backend', error);

      // Prepare an error message
      const errorMessage = { type: 'bot', text: error.message || 'Error fetching response. Please try again.' };
      setChatHistory([...chatHistory, newMessage, errorMessage]);
    }

    // Clear the input field
    setQuery('');
  };

  // Function to handle "Enter" key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendQuery();
    }
  };

  return (
    <div className="app">
      <div className="chat-box">
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="input-box">
        <input
          type="text"
          placeholder="Ask anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={sendQuery}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default App;
