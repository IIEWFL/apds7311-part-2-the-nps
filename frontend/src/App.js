import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Welcome from './components/auth/Welcome'; // Import the Welcome component
import Login from './components/auth/Login'; // Import the Login component
import Payments from './components/payments/Payment_Client'; // Import the Payment component
import Payment from './components/payments/Payment_Staff'; // Import the Payment component
import Register from './components/auth/Register'; // Import the Register component
import './App.css'; // Import the main CSS file for styling

// For more information, visit: https://reactrouter.com/en/main/start/overview
// Additional reference: https://ui.dev/react-router-tutorial

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Welcome />} /> {/* Route for the Welcome component */}
          <Route path="/login" element={<Login />} /> {/* Route for the Login component */}
          <Route path="/register" element={<Register />} /> {/* Route for the Register component */}
          <Route path="/payments" element={<Payments />} /> {/* Route for the Payments_Client component */}
          <Route path="/payment" element={<Payment />} /> {/* Route for the Payments_Staff component */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

/* This code was adapted from various tutorials on React Router for routing and navigation */
// This method was adapted from the Express documentation on routing and various tutorials on transaction management
// https://expressjs.com/en/guide/routing.html
// Express Documentation
// https://expressjs.com/
