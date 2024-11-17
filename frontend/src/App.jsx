import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Chat from './pages/Chat';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
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
      <div className="min-h-screen bg-dark text-gray-200 font-sans">
        <header className="fixed top-0 w-full bg-primary text-white p-4 flex justify-between items-center z-10">
          <h2 className="text-xl">SalesSense AI</h2>
          {token && (
            <button
              onClick={handleLogout}
              className="bg-white text-primary px-6 py-2 rounded hover:bg-gray-100 transition-colors duration-300"
            >
              Logout
            </button>
          )}
        </header>

        <div className="pt-20 px-4">
          <Routes>
            <Route path="/" element={token ? <Navigate to="/chat" /> : <SignIn onSignIn={handleLogin} />} />
            <Route path="/signup" element={<SignUp onSignUp={() => { /* Handle post-signup redirect or notification */ }} />} />
            <Route path="/chat" element={token ? <Chat token={token} /> : <Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
