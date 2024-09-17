import { useState } from 'react';
import axios from 'axios';
import './SignIn.css';
import PropTypes from 'prop-types';

const SignIn = ({ onSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      localStorage.setItem('token', response.data.token);
      onSignIn(response.data.token);
    } catch (error) {
      setError('Invalid email or password',error);
    }
  };

  return (
    <div className="signin-container">
      <form className="signin-form" onSubmit={handleSignIn}>
        <h2>Sign In</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign In</button>
        {error && <div className="error">{error}</div>}
        <a href="/signup" className="signup-link">{"Don't have an account? Sign Up"}</a>
      </form>
    </div>
  );
};

SignIn.propTypes = {
  onSignIn: PropTypes.func.isRequired,
};

export default SignIn;
