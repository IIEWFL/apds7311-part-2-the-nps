import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Welcome from './components/auth/Welcome'; // Import the Welcome component
import Login from './components/auth/Login'; // Import the Login component
import Payments from './components/payments/Payment_Client'; // Import the Payment component
import Payment from './components/payments/Payment_Staff'; // Import the Payment component
import Register from './components/auth/Register'; // Import the Register component
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} /> {/* Route for the Login component */}
          <Route path="/register" element={<Register />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/payment" element={<Payment />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

