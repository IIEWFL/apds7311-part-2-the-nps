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
            <p>This is a payment system, which allows you to make international payments.</p>

            {/* Tabs navigation */}
            <div className="tabs">
                <button onClick={handleLoginClick}>Login</button>
                <button onClick={() => handleTabClick('register')}>Register</button>
                <button onClick={() => handleTabClick('payments')}>Payment</button>
            </div>

            {/* Tab content */}
            <div className="tab-content">
                {activeTab === 'login' && (
                    <div>
                        <h2>Login</h2>
                        <p>This is the login tab content.</p>
                    </div>
                )}
                {activeTab === 'register' && (
                    <div>
                        <h2>Register</h2>
                        <p>This is the register tab content.</p>
                    </div>
                )}
                {activeTab === 'payments' && (
                    <div>
                        <h2>Payments</h2>
                        <p>This is the payment tab content.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Welcome;
