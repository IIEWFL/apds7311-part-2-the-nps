import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Payment_Staff.css'; // Import your CSS file for styling

function Payments_Staff() {
  const navigate = useNavigate(); // Hook for navigating
  const [transactions, setTransactions] = useState([]); // State for storing transactions
  const [selectedTransaction, setSelectedTransaction] = useState(null); // State for the selected transaction

  // Fetch transactions when the component is mounted
  useEffect(() => {
    async function fetchTransactions() {
      try {
        const token = localStorage.getItem('token'); // Retrieve the auth token

        // If token is not available, redirect to login
        if (!token) {
          console.error('No token found, redirecting to login.');
          navigate('/login'); // Adjust the route for your login page
          return;
        }

        // Make the API request with the token in the Authorization header
        const response = await axios.get('https://localhost:5000/api/get', {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the token
          },
        });

        // Log the API response
        console.log('API response received:', response.data);
        // Update the state with the transactions from the response
        setTransactions(response.data.transactions); // Set the transactions state correctly
      } catch (error) {
        console.error('Error fetching transactions:', error);

        // Log the error response for more detail
        if (error.response) {
          console.error('Error response:', error.response.data);
        }

        // Handle the 401 Unauthorized error
        if (error.response && error.response.status === 401) {
          console.error('Unauthorized - Redirecting to login');
          navigate('/login'); // Redirect to login if unauthorized
        }
      }
    }

    fetchTransactions(); // Call the fetch function when component mounts
  }, [navigate]);

  // Function to handle transaction selection
  const handleSelectTransaction = (transaction) => {
    console.log('Transaction selected:', transaction);
    setSelectedTransaction(transaction);
  };

  // Function to approve the selected transaction
  const handleApprove = async () => {
    if (selectedTransaction) {
      console.log('Approving transaction:', selectedTransaction);
      const token = localStorage.getItem('token'); // Retrieve the auth token

      try {
        // Send a request to approve the transaction
        await axios.put(`https://localhost:5000/api/status/${selectedTransaction._id}`, {
          status: 'approved', // Update the status to approved
        }, {
          headers: {
            Authorization: `Bearer ${token}`, // Include token
          },
        });

        // Update the local state to reflect the change
        setTransactions(transactions.map(transaction =>
          transaction._id === selectedTransaction._id
            ? { ...transaction, status: 'approved' }
            : transaction
        ));
        setSelectedTransaction(null); // Clear the selected transaction
      } catch (error) {
        console.error('Error approving transaction:', error); // Log any errors
      }
    } else {
      console.warn('No transaction selected for approval.');
    }
  };

  // Function to save the selected transaction
  const handleSave = async () => {
    if (selectedTransaction) {
      console.log('Saving transaction:', selectedTransaction);
      const token = localStorage.getItem('token'); // Retrieve the auth token

      try {
        // Send a request to save the transaction
        await axios.post('https://localhost:5000/api/save', selectedTransaction, {
          headers: {
            Authorization: `Bearer ${token}`, // Include token
          },
        });

        console.log('Transaction saved successfully.');
        // Optionally, refresh the transaction list or provide feedback to the user
      } catch (error) {
        console.error('Error saving transaction:', error); // Log any errors
      }
    } else {
      console.warn('No transaction selected for saving.');
    }
  };

  return (
    <div className="payments-container">
      <div className="payments-box">
        <h1 className="payments-title">Payments</h1>
        <p>Here you can manage client transactions.</p>

        {/* Transaction History Section */}
        <h2 className="transaction-title">Transaction History</h2>
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>From Account</th>
              <th>To Account</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Status</th> {/* Status Column */}
              <th>Payment Method</th> {/* Payment Method Column */}
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map(transaction => (
                <tr 
                  key={transaction._id} 
                  onClick={() => handleSelectTransaction(transaction)} 
                  className={selectedTransaction && selectedTransaction._id === transaction._id ? 'selected' : ''}
                >
                  <td>
                    <input type="checkbox" checked={selectedTransaction && selectedTransaction._id === transaction._id} readOnly />
                  </td>
                  <td>{transaction.fromAccount}</td>
                  <td>{transaction.toAccount}</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.currency}</td>
                  <td>{transaction.status}</td>
                  <td>{transaction.paymentMethod}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No transactions found</td> {/* Adjusted colspan */}
              </tr>
            )}
          </tbody>
        </table>

        {/* Action Buttons */}
        <div className="button-group">
          <button className="approve-button" onClick={handleApprove} disabled={!selectedTransaction}>
            Approve
          </button>
          
          <button className="save-button" onClick={handleSave} disabled={!selectedTransaction} style={{ backgroundColor: 'blue', color: 'white' }}>
            Submitted to SWIFT
          </button>
          <button className="back-button" onClick={() => navigate('/')}>
            Back to Welcome
          </button>
        </div>
      </div>
    </div>
  );
}

export default Payments_Staff;

/* This code was adapted from various tutorials on React, Axios, and useEffect for data fetching and state management */
// This method was adapted from the Express documentation on routing and various tutorials on transaction management
// https://expressjs.com/en/guide/routing.html
// Express Documentation
// https://expressjs.com/
