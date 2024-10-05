import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Welcome.css'; // Import the CSS file

function Welcome() {
  const navigate = useNavigate(); // Hook for navigating
  const [activeTab, setActiveTab] = useState('login'); // State for active tab

  // Function to handle the login button click
  const handleLoginClick = () => {
    navigate('/login'); // Navigate to the Login route
  };

  // Function to handle tab switching
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
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
          onClick={() => handleTabClick('register')}
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default Welcome;
