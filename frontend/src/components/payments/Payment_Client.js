import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Payment_Client.css'; // Import your CSS file for styling
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Validation schema using Yup for form validation
const validationSchema = Yup.object({
  fromAccount: Yup.string().required('From Account is required'),
  toAccount: Yup.string().required('To Account is required'),
  amount: Yup.number().min(1, 'Amount must be at least 1').required('Amount is required'),
  type: Yup.string()
    .oneOf(['deposit', 'withdrawal'], 'Invalid transaction type')
    .required('Transaction type is required'),
  currency: Yup.string()
    .oneOf(['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'ZAR', 'CAD', 'CHF', 'CNY'], 'Invalid currency')
    .required('Currency is required'),
  paymentMethod: Yup.string()
    .oneOf(['credit_card', 'debit_card', 'bank_transfer', 'paypal'], 'Invalid payment method')
    .required('Payment method is required'),
});

function Payments_Client() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

  // Fetch transactions for the current user from the backend when the component is mounted
  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await axios.get('https://localhost:5000/api'); // Adjust the API endpoint as needed
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    }
    fetchTransactions();
  }, []);

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, setErrors, resetForm }) => {
    try {
      await axios.post('https://localhost:5000/api', values); // Post the form data to the backend
      alert('This is a Windows alert message.');
      // Fetch and refresh the transactions after submitting a new one
      const response = await axios.get('https://localhost:5000/api');
      setTransactions(response.data); // Update the transaction history
      resetForm(); // Reset the form fields after submission
    } catch (err) {
      if (err.response) {
        setErrors({ serverError: err.response.data.message }); // Display server error
      } else {
        setErrors({ serverError: 'Something went wrong. Please try again.' });
      }
    } finally {
      setSubmitting(false); // Stop the submitting state
    }
  };

  // Handle cancel button - reset the form fields
  const handleCancel = (resetForm) => {

    alert('This is a Windows alert message.');
    resetForm(); // Reset the form fields when cancel is clicked
  };

  return (
    <div className="payments-container">
      <div className="payments-box">
        <h1 className="payments-title">Payments</h1>
        <p>Here is where you can make your transactions and see a list of all your past transactions.</p>

        {/* Formik form for payments */}
        <Formik
          initialValues={{
            fromAccount: '',
            toAccount: '',
            amount: '',
            type: '',
            currency: '',
            paymentMethod: '',
            swiftcode: ''
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, resetForm }) => (
            <Form>
              <div className="form-group">
                <label htmlFor="fromAccount">From Account:</label>
                <Field
                  type="text"
                  id="fromAccount"
                  name="fromAccount"
                  placeholder="Enter from account"
                  className="input-field"
                />
                <ErrorMessage name="fromAccount" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="toAccount">To Account:</label>
                <Field
                  type="text"
                  id="toAccount"
                  name="toAccount"
                  placeholder="Enter to account"
                  className="input-field"
                />
                <ErrorMessage name="toAccount" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="amount">Amount:</label>
                <Field
                  type="number"
                  id="amount"
                  name="amount"
                  placeholder="Enter amount"
                  className="input-field"
                />
                <ErrorMessage name="amount" component="div" className="error-message" />
              </div>

            
              <div className="form-group">
                <label htmlFor="currency">Currency:</label>
                <Field as="select" id="currency" name="currency" className="input-field">
                  <option value="">Select currency</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="AUD">AUD</option>
                  <option value="ZAR">ZAR</option>
                  <option value="CAD">CAD</option>
                  <option value="CHF">CHF</option>
                  <option value="CNY">CNY</option>
                </Field>
                <ErrorMessage name="currency" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method:</label>
                <Field as="select" id="paymentMethod" name="paymentMethod" className="input-field">
                  <option value="">Select payment method</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">Paypal</option>
                </Field>
                <ErrorMessage name="paymentMethod" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="toAccount">SWITF Code:</label>
                <Field
                  type="text"
                  id="toAccount"
                  name="toAccount"
                  placeholder="Enter to account"
                  className="input-field"
                />
                <ErrorMessage name="toAccount" component="div" className="error-message" />
              </div>

              {errors.serverError && <p className="error-message">{errors.serverError}</p>}

              <div className="button-group">
                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Make Payment'}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => handleCancel(resetForm)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Cancel Payment'}
                </button>
                <button type="button" className="back-button" onClick={() => navigate('/')}>
                  Back to Welcome
                </button>
              </div>
            </Form>
          )}
        </Formik>

        {/* Transaction History Section */}
        <h2 className="transaction-title">Transaction History</h2>
        <table className="transaction-table">
          <thead>
            <tr>
              <th>From Account</th>
              <th>To Account</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Currency</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map(transaction => (
                <tr key={transaction._id}>
                  <td>{transaction.fromAccount}</td>
                  <td>{transaction.toAccount}</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.type}</td>
                  <td>{transaction.currency}</td>
                  <td>{new Date(transaction.transactionDate).toLocaleString()}</td>
                  <td>{transaction.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No transactions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Payments_Client;
