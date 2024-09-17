import { useState } from 'react';
import axios from 'axios';
import './SignUp.css';
import PropTypes from 'prop-types';

const SignUp = ({ onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://salessense-ai.onrender.com/api/register', { email, password });
      onSignUp();
    } catch (error) {
      setError('Error creating account',error);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSignUp}>
        <h2>Sign Up</h2>
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
        <button type="submit">Sign Up</button>
        {error && <div className="error">{error}</div>}
        <a href="/" className="signin-link">Already have an account? Sign In</a>
      </form>
    </div>
  );
}

SignUp.propTypes = {
  onSignUp: PropTypes.func.isRequired,
};

export default SignUp;
