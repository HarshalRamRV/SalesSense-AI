import { useState } from 'react';
import axios from 'axios';
import { FaPaperPlane } from 'react-icons/fa';
import './App.css';

const App = () => {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendQuery = async () => {
    if (!query) return;

    const newMessage = { type: 'user', text: query };
    setChatHistory([...chatHistory, newMessage]);

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/query', { query });
      const { gpt_response, sql_result } = response.data;

      const gptMessage = { type: 'bot', text: gpt_response || 'No response from GPT' };
      const sqlMessages = sql_result && Array.isArray(sql_result) 
        ? [{ type: 'bot', content: sql_result }] 
        : [];

      setChatHistory([...chatHistory, newMessage, gptMessage, ...sqlMessages]);
    } catch (error) {
      const errorMessage = { type: 'bot', text: 'Error fetching response. Please try again.' };
      setChatHistory([...chatHistory, newMessage, errorMessage]);
    }

    setLoading(false);
    setQuery('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendQuery();
    }
  };

  const renderTable = (data) => {
    if (!data || data.length === 0) return null;

    const keys = Object.keys(data[0]);

    return (
      <table className="sql-result-table">
        <thead>
          <tr>
            {keys.map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {keys.map((key) => (
                <td key={key}>{row[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h2>Customer Support Chatbot</h2>
      </header>

      <div className="chat-box">
        {loading && <div className="typing-indicator">Bot is typing...</div>}
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
          >
            {message.text}
            {message.content && renderTable(message.content)}
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
        <button onClick={sendQuery} disabled={loading}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default App;
