import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Welcome from './components/auth/Welcome'; // Import the Welcome component
import Login from './components/auth/Login_Client'; // Import the Login component
import Payment from './components/auth/Payments_Client'; // Import the Payment component
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} /> {/* Route for the Login component */}
          <Route path="/payment" element={<Payment />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

