import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Welcome.css'; // Import the CSS file

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

  // Function to handle the register button click
  const handlePaymentsClick = () => {
    setActiveTab('payments'); // Set active tab to register
    navigate('/payments'); // Navigate to the Register route
  };

   // Function to handle the register button click
   const handlePaymentClick = () => {
    setActiveTab('payment'); // Set active tab to register
    navigate('/payment'); // Navigate to the Register route
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
        <button 
          className={activeTab === 'payments' ? 'active-tab' : ''} 
          onClick={handlePaymentsClick}
        >
          Payments -Client
        </button>
        <button 
          className={activeTab === 'payment' ? 'active-tab' : ''} 
          onClick={handlePaymentClick}
        >
          Payments -Staff
        </button>
      </div>
    </div>
  );
}

export default Welcome;
