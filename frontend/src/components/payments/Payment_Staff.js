import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Payment_Staff.css'; // Import your CSS file for styling

// For more information, visit: https://reactrouter.com/en/main/start/overview
// Additional reference: https://ui.dev/react-router-tutorial

function Payments_Staff() {
  const navigate = useNavigate(); // Hook for navigating
  const [transactions, setTransactions] = useState([]); // State for storing transactions
  const [selectedTransaction, setSelectedTransaction] = useState(null); // State for the selected transaction

  // Fetch transactions when the component is mounted
  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await axios.get('/api'); // Adjust the API endpoint as needed
        setTransactions(response.data); // Set the fetched transactions to state
      } catch (error) {
        console.error('Error fetching transactions:', error); // Log any errors
      }
    }
    fetchTransactions(); // Call the function to fetch transactions
  }, []);

  // Function to handle transaction selection
  const handleSelectTransaction = (transaction) => {
    setSelectedTransaction(transaction); // Set the selected transaction to state
  };

  // Function to approve the selected transaction
  const handleApprove = async () => {
    if (selectedTransaction) {
      try {
        await axios.put(`/api/${selectedTransaction._id}/approve`); // Adjust the API endpoint as needed
        setTransactions(transactions.filter(transaction => transaction._id !== selectedTransaction._id)); // Remove the approved transaction from the list
        setSelectedTransaction(null); // Clear the selected transaction
      } catch (error) {
        console.error('Error approving transaction:', error); // Log any errors
      }
    }
  };

  // Function to cancel the selected transaction
  const handleCancel = async () => {
    if (selectedTransaction) {
      try {
        await axios.delete(`/api/${selectedTransaction._id}`); // Adjust the API endpoint as needed
        setTransactions(transactions.filter(transaction => transaction._id !== selectedTransaction._id)); // Remove the canceled transaction from the list
        setSelectedTransaction(null); // Clear the selected transaction
      } catch (error) {
        console.error('Error canceling transaction:', error); // Log any errors
      }
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
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map(transaction => (
                <tr key={transaction._id} onClick={() => handleSelectTransaction(transaction)} className={selectedTransaction === transaction ? 'selected' : ''}>
                  <td><input type="checkbox" checked={selectedTransaction === transaction} readOnly /></td>
                  <td>{transaction.fromAccount}</td>
                  <td>{transaction.toAccount}</td>
                  <td>{transaction.amount}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No transactions found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Action Buttons */}
        <div className="button-group">
          <button className="approve-button" onClick={handleApprove} disabled={!selectedTransaction}>
            Approve
          </button>
          <button className="cancel-button" onClick={handleCancel} disabled={!selectedTransaction}>
            Cancel
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
