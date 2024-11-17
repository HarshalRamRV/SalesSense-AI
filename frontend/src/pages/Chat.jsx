import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaPaperPlane } from "react-icons/fa";

const Chat = ({ token }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const latestMessageRef = useRef(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const token = localStorage.getItem("token"); // or however you store your token
        const response = await fetch("http://localhost:5000/api/chat/history", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch chat history");
        }

        const data = await response.json();
        setChatHistory(data);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        // Handle error appropriately (e.g., show error message to user)
      }
    };

    fetchChatHistory();
  }, [token]);

  useEffect(() => {
    if (latestMessageRef.current) {
      latestMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const sendQuery = async () => {
    if (!query) return;

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/chat/query",
        { query, token }, // Include token here
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Ensure the content type is correct
          },
        }
      );
      const { sql_result } = response.data;
      const sqlResultString = JSON.stringify(sql_result);

      setChatHistory((prevHistory) => [
        ...prevHistory,
        {
          user_text: query,
          bot_text: sqlResultString,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error(
        "Error sending query:",
        error.response ? error.response.data : error.message
      );
    }

    setLoading(false);
    setQuery("");
  };


  const renderTable = (data) => {
    if (!data || data.length === 0) return null;
    const keys = Object.keys(data[0]);

    return (
      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {keys.map((key) => (
                <th key={key} className="text-left p-2 border-b border-gray-600">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {keys.map((key) => (
                  <td key={key} className="p-2 border-b border-gray-700">
                    {row[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="w-full h-[400px] bg-dark-secondary rounded-lg p-4 mb-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {chatHistory.map((chat, index) => (
          <div 
            key={index} 
            ref={index === chatHistory.length - 1 ? latestMessageRef : null}
            className="mb-4"
          >
            {/* User Message */}
            <div className="flex justify-end mb-2">
              <div className="bg-blue-900 text-white p-3 rounded-lg max-w-[80%] md:max-w-[40%]">
                <p className="break-words">{chat.user_text}</p>
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {new Date(chat.timestamp).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Bot Message */}
            {chat.bot_text && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-white p-3 rounded-lg max-w-[80%] md:max-w-[40%] overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {(() => {
                    try {
                      const cleanedMessage = chat.bot_text.replace(/'/g, '"');
                      const parsedMessage = JSON.parse(cleanedMessage);
                      return Array.isArray(parsedMessage)
                        ? renderTable(parsedMessage)
                        : parsedMessage;
                    } catch (error) {
                      return chat.bot_text;
                    }
                  })()}
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(chat.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="text-gray-500 italic">Bot is typing...</div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex w-full gap-2">
        <input
          type="text"
          placeholder="Ask anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendQuery()}
          className="flex-1 p-3 bg-dark-input border border-gray-700 rounded text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
        <button
          onClick={sendQuery}
          disabled={loading}
          className="p-3 bg-primary text-white rounded hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <FaPaperPlane className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

Chat.propTypes = {
  token: PropTypes.string.isRequired,
};

export default Chat;
