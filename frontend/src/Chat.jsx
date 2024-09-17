import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaPaperPlane } from 'react-icons/fa';
import './Chat.css';

const Chat = ({ token }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const chatBoxRef = useRef(null);
  const latestMessageRef = useRef(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const result = await axios.get('https://salessense-ai.onrender.com/api/chat-history',{params: { token }}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setChatHistory(result.data);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
  }, [token]);

  useEffect(() => {
    if (latestMessageRef.current) {
      latestMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const sendQuery = async () => {
    if (!query) return;
  
    setLoading(true);
  
    try {
      const response = await axios.post('https://salessense-ai.onrender.com/api/query', 
        { query, token },  // Include token here
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'  // Ensure the content type is correct
          },
        }
      );
      const { sql_result } = response.data;
      const sqlResultString = JSON.stringify(sql_result);
  
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { user_message: query, bot_message: sqlResultString, timestamp: new Date().toISOString() }
      ]);
    } catch (error) {
      console.error('Error sending query:', error.response ? error.response.data : error.message);
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
    <div className="chat">
      <div className="chat-box" ref={chatBoxRef}>
        {chatHistory.map((chat, index) => (
          <div key={index} className="message-container" ref={index === chatHistory.length - 1 ? latestMessageRef : null}>
            <div className="message user-message">
              {chat.user_message}
              <div className="message-timestamp">{new Date(chat.timestamp).toLocaleString()}</div>
            </div>

            {chat.bot_message && (
              <div className="message bot-message">
                {(() => {
                  try {
                    const cleanedMessage = chat.bot_message.replace(/'/g, '"');
                    const parsedMessage = JSON.parse(cleanedMessage);
                    return Array.isArray(parsedMessage) ? renderTable(parsedMessage) : parsedMessage;
                  } catch (error) {
                    console.error('Error parsing bot message:', error);
                    return chat.bot_message;
                  }
                })()}
                <div className="message-timestamp">{new Date(chat.timestamp).toLocaleString()}</div>
              </div>
            )}
          </div>
        ))}

        {loading && <div className="typing-indicator">Bot is typing...</div>}
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

Chat.propTypes = {
  token: PropTypes.string.isRequired,
};

export default Chat;
