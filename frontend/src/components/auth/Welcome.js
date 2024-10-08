import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Welcome.css'; // Import the CSS file

// For more information, visit: https://reactrouter.com/en/main/start/overview
// Additional reference: https://ui.dev/react-router-tutorial

function Welcome() {
  const navigate = useNavigate(); // Hook for navigating
  const [activeTab, setActiveTab] = useState('login'); // State for active tab

  // Function to handle the login button click
  const handleLoginClick = () => {
    setActiveTab('login'); // Set active tab to login
    navigate('/login'); // Navigate to the Login route
  };

  // Function to handle the register button click
  const handleRegisterClick = () => {
    setActiveTab('register'); // Set active tab to register
    navigate('/register'); // Navigate to the Register route
  };

  

  return (
    <div className="welcome-container">
      <h1>Welcome</h1>
      <p>This is a payment system that allows you to make international payments.</p>

      {/* Tabs navigation */}
      <div className="tabs">
        <button 
          className={activeTab === 'login' ? 'active-tab' : ''} 
          onClick={handleLoginClick}
        >
          Login
        </button>
        <button 
          className={activeTab === 'register' ? 'active-tab' : ''} 
          onClick={handleRegisterClick}
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default Welcome;
/* This code was adapted from various tutorials on React, Formik, and Yup for form handling and validation */
// This method was adapted from the Express documentation on routing and various tutorials on transaction management
// https://expressjs.com/en/guide/routing.html
// Express Documentation
// https://expressjs.com/
