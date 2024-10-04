import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Login_Client.css'; // Import the CSS file for styling
import { header } from 'express-validator';

function Login() {
  const [username, setUsername] = useState('');
  const [accountNumber, setAccountNumber] = useState(''); // New state for account number
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate(); // Hook for navigating

  // Function to handle the back button click
  const handleBackClick = () => {
    navigate('/'); // Navigate back to the Welcome page
  };

  // Function to handle login (example)
  const handleLoginClick = async (e) => {
    e.preventDefault();
    setError(''); // Clear error if login is valid

    try
    {
      const repsonse = awiat fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username,password})
      });
      const data = await response.json();

      if(data.error)
      {
        setError(data.error);
      }
      else
      {
          localStorage.setItem('token', data.token);
          window.location.gref = '/';
      }

    }
    catch (err)
    {
        if(err.resonse){
          setError(err.response.data.message);
        }
        else{
          setError('Something went wrong. Please try again.');
        }
    }
    // Implement login logic here
    if (!username || !accountNumber || !password) {
      setError('Username, account number, and password are required.');
      return;
    }
  };

  return (
    <div className="login-container">
      <h1>Login Page</h1>
      <p>Please enter your username, account number, and password to log in.</p>
      
      <div className="form-group">
        <label  htmlFor="username" >Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)} // Handle input change
          placeholder="Enter your username"
          className="input-field"
          autoComplete='true'
        />
      </div>

      <div className="form-group">
        <label htmlFor="accountNumber">Account Number:</label> {/* New label for account number */}
        <input
          type="text"
          id="accountNumber"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)} // Handle input change
          placeholder="Enter your account number"
          className="input-field"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Handle input change
          placeholder="Enter your password"
          className="input-field"
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="button-group">
        <button type="button" className="login-button" onClick={handleLoginClick}>Login</button>
        <button type="button" className="back-button" onClick={handleBackClick}>Back to Welcome</button>
      </div>
    </div>
  );
}

export default Login;
