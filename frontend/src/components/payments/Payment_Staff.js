import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Payment_Staff.css'; // Import your CSS file for styling

function Payments_Staff() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Fetch transactions when the component is mounted
  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await axios.get('/api/transactions'); // Adjust the API endpoint as needed
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    }
    fetchTransactions();
  }, []);

  // Function to handle transaction selection
  const handleSelectTransaction = (transaction) => {
    setSelectedTransaction(transaction);
  };

  // Function to approve the selected transaction
  const handleApprove = async () => {
    if (selectedTransaction) {
      try {
        await axios.put(`/api/transactions/${selectedTransaction._id}/approve`); // Adjust the API endpoint as needed
        setTransactions(transactions.filter(transaction => transaction._id !== selectedTransaction._id));
        setSelectedTransaction(null);
      } catch (error) {
        console.error('Error approving transaction:', error);
      }
    }
  };

  // Function to cancel the selected transaction
  const handleCancel = async () => {
    if (selectedTransaction) {
      try {
        await axios.delete(`/api/transactions/${selectedTransaction._id}`); // Adjust the API endpoint as needed
        setTransactions(transactions.filter(transaction => transaction._id !== selectedTransaction._id));
        setSelectedTransaction(null);
      } catch (error) {
        console.error('Error canceling transaction:', error);
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
