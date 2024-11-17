import { useState } from 'react';
import axios from 'axios';
// import './SignIn.css';
import PropTypes from 'prop-types';

const SignIn = ({ onSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', { email, password });
      localStorage.setItem('token', response.data.token);
      onSignIn(response.data.token);
    } catch (error) {
      setError('Invalid email or password',error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-dark">
      <form 
        onSubmit={handleSignIn}
        className="bg-dark-secondary p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl mb-6 text-center">Sign In</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 p-3 bg-dark-input border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-primary"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-4 p-3 bg-dark-input border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-primary"
        />
        <button 
          type="submit"
          className="w-full bg-primary text-white p-3 rounded hover:bg-blue-700 transition-colors duration-300"
        >
          Sign In
        </button>
        {error && <div className="text-red-500 mt-4">{error}</div>}
        <a 
          href="/signup" 
          className="block mt-4 text-center text-primary hover:underline"
        >
          Don&apos;t have an account? Sign Up
        </a>
      </form>
    </div>
  );
};

SignIn.propTypes = {
  onSignIn: PropTypes.func.isRequired,
};

export default SignIn;
