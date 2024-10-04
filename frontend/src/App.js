import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Welcome from './components/auth/Welcome';
import Login from './components/auth/Login'; // Import the Login component
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Define the route for the Welcome page */}
          <Route path="/" element={<Welcome />} />
          {/* Define the route for the Login page */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
