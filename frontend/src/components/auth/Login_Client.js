import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login_Client.css'; // Import the CSS file for styling
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate(); // Hook for navigating

  const handleBackClick = () => {
    navigate('/'); // Navigate back to the Welcome page
  };

  const handleLoginClick = async (e) => {
    e.preventDefault();
    setError(''); // Clear error if login is valid

    if (!username || !accountNumber || !password) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        accountNumber,
        password
      });

      localStorage.setItem('token', response.data.token);
      navigate('/payments');
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Login</h1>
        <p className="login-description">Please enter your login details below.</p>

        <form onSubmit={handleLoginClick}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="accountNumber">Account Number:</label>
            <input
              type="text"
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter your account number"
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input-field"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="button-group">
            <button type="submit" className="login-button">Login</button>
            <button type="button" className="back-button" onClick={handleBackClick}>Back to Welcome</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
