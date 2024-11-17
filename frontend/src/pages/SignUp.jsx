import { useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
const SignUp = ({ onSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/users/register", {
        email,
        password,
      });
      onSignUp();
      navigate("/"); // Redirect to sign in page after successful registration
    } catch (error) {
      setError(error.response?.data?.error || "Error creating account");
    }
  };
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-dark">
      <form
        onSubmit={handleSignUp}
        className="bg-dark-secondary p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl mb-6 text-center text-gray-200">Sign Up</h2>
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
          Sign Up
        </button>
        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
        <a
          href="/"
          className="block mt-4 text-center text-primary hover:underline"
        >
          Already have an account? Sign In
        </a>
      </form>
    </div>
  );
};
SignUp.propTypes = {
  onSignUp: PropTypes.func.isRequired,
};
export default SignUp;
