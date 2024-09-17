import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Chat from './Chat';
import SignIn from './SignIn';
import SignUp from './SignUp';
import './App.css';

const App = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogin = (token) => {
    setToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h2>Customer Support Chatbot</h2>
          {token && <button className="logout-btn" onClick={handleLogout}>Logout</button>}
        </header>

        <Routes>
          <Route path="/" element={token ? <Navigate to="/chat" /> : <SignIn onSignIn={handleLogin} />} />
          <Route path="/signup" element={<SignUp onSignUp={() => { /* Handle post-signup redirect or notification */ }} />} />
          <Route path="/chat" element={token ? <Chat token={token} /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
