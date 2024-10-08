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
  swiftcode: Yup.string().required('Swift code is required'),
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
      await axios.post('https://localhost:5000/api', // Post the form data to the backend
        {
          fromAccount: values.fromAccount,
          toAccount: values.toAccount,
          amount: values.amount,
          currency: values.currency,
          swiftCode: values.swiftcode,
          paymentMethod: values.paymentMethod
        }
      );

      alert('Payment successful.');

      // Optionally reset the form after submission
      resetForm();
    } catch (err) {
      if (err.response) {
        alert(err.response.data.message);
        setErrors({ serverError: err.response.data.message });
      } else {
        setErrors({ serverError: 'Something went wrong. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel button - reset the form fields
  const handleCancel = (resetForm) => {
    alert('Transaction canceled.');
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
                <label htmlFor="fromAccountId_Client">From Account:</label>
                <Field
                  type="text"
                  id="fromAccountId_Client"
                  name="fromAccount"
                  placeholder="Enter from account"
                  className="input-field"
                />
                <ErrorMessage name="fromAccount" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="toAccountId_Client">To Account:</label>
                <Field
                  type="text"
                  id="toAccountId_Client"
                  name="toAccount"
                  placeholder="Enter to account"
                  className="input-field"
                />
                <ErrorMessage name="toAccount" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="amountId_Client">Amount:</label>
                <Field
                  type="number"
                  id="amountId_Client"
                  name="amount"
                  placeholder="Enter amount"
                  className="input-field"
                />
                <ErrorMessage name="amount" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="currencyId_Client">Currency:</label>
                <Field as="select" id="currencyId_Client" name="currency" className="input-field">
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
                <label htmlFor="paymentMethodId_Client">Payment Method:</label>
                <Field as="select" id="paymentMethodId_Client" name="paymentMethod" className="input-field">
                  <option value="">Select payment method</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">Paypal</option>
                </Field>
                <ErrorMessage name="paymentMethod" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="swiftcodeId_Client">Swift Code:</label>
                <Field as="select" id="swiftcodeId_Client" name="swiftcode" className="input-field">
                  <option value="">Select Swift Code</option>
                  <option value="Absa Bank - ABSAZAJJ">Absa Bank - ABSAZAJJ</option>
                  <option value="Standard Bank - SBZAZAJJ">Standard Bank - SBZAZAJJ</option>
                  <option value="First National Bank (FNB) - FIRNZAJJ">First National Bank (FNB) - FIRNZAJJ</option>
                  <option value="Nedbank - NEDSZAJJ">Nedbank - NEDSZAJJ</option>
                  <option value="Capitec Bank - CABLZAJJ">Capitec Bank - CABLZAJJ</option>
                  <option value="Investec Bank - INVZZAJJ">Investec Bank - INVZZAJJ</option>
                  <option value="African Bank - AFSIZAJJ">African Bank - AFSIZAJJ</option>
                  <option value="HSBC Bank - HSBCZAJJ">HSBC Bank - HSBCZAJJ</option>
                  <option value="Rand Merchant Bank - RMBKZAJJ">Rand Merchant Bank - RMBKZAJJ</option>
                </Field>
                <ErrorMessage name="swiftcode" component="div" className="error-message" />
              </div>

              {errors.serverError && <p className="error-message">{errors.serverError}</p>}

              <div className="button-group">
                <button
                  type="submit"
                  className="submit-button"
                  onClick={() => handleSubmit}
                  disabled={isSubmitting}
                >
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
              <th>Currency</th>
              <th>Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.fromAccount}</td>
                <td>{transaction.toAccount}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.currency}</td>
                <td>{transaction.paymentMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Payments_Client;
