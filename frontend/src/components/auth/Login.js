import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Ensure you update your CSS to match the styles below
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// For more information, visit: https://reactrouter.com/en/main/start/overview
// Additional reference: https://ui.dev/react-router-tutorial

// Dynamic validation schema using Yup
const validationSchema = (userType) => Yup.object({
  username: Yup.string()
    .matches(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers.')
    .required('Username is required'),
  accountNumber: userType === 'Client' 
    ? Yup.string()
        .matches(/^\d+$/, 'Account Number must be numeric')
        .required('Account Number is required')
    : Yup.string(), // Not required for staff
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 'Password must contain at least one letter and one number.')
    .required('Password is required'),
});

function Login() {
  const navigate = useNavigate(); // Hook for navigating
  const [userType, setUserType] = useState('Client'); // State for user type

  const handleBackClick = () => {
    navigate('/'); // Navigate back to the Welcome page
  };

  const handleLoginClick = async (values, { setSubmitting, setErrors }) => {
   console.log("Login attempt with values:", values); // Log login values

    try {
      // Dynamically set the API path based on the userType
      const apiPath = userType === 'Client' 
        ? 'https://localhost:5000/api/auth/login/user' 
        : 'https://localhost:5000/api/auth/login/staff';

      console.log("API Path:", apiPath); // Log API path

      // Make the POST request to the appropriate path
      const response = await axios.post(apiPath, {
        username: values.username,
        password: values.password, // Ensure password is included
        accountNumber: userType === 'Client' ? values.accountNumber : undefined, // Only send accountNumber for "Client"
      });


      console.log("Response data:", response.data); // Log response data

      // Store the token in local storage

      localStorage.setItem('token', response.data.token);

      // Navigate to the correct payments page based on user type
      if (userType === 'Client') {
        navigate('/payments'); // Navigate to Payments_Clients for "Client"
      } else {
        navigate('/payment'); // Navigate to Payments_Staff for "Staff"
      }
    } catch (err) {

      console.error("Login error:", err); // Log the error

      if (err.response) {
        // Display specific error message from server
        setErrors({ serverError: err.response.data.message || 'Invalid login details.' });
      } else {
        setErrors({ serverError: 'Something went wrong. Please try again.' });
      }
    } finally {
      setSubmitting(false); // Stop the form submission state
    }
  };

  return (
    <div className="container"> {/* Container for the login form */}
      <div className="login-container">
        <div className="login-box">
          <h1 className="login-title">Login</h1>
          <p className="login-description">Please enter your login details below.</p>

          <Formik
            initialValues={{ username: '', accountNumber: '', password: '' }} // Initial form values
            validationSchema={validationSchema(userType)} // Validation schema based on user type
            onSubmit={handleLoginClick} // Form submission handler
          >
            {({ isSubmitting, errors }) => (
              <Form>
                <div className="form-group">
                  <label htmlFor="userType">User Type:</label>
                  <Field
                    as="select"
                    id="userType"
                    name="userType"
                    className="input-field"
                    onChange={(e) => setUserType(e.target.value)} // Update user type
                    value={userType}
                  >
                    <option value="Client">Client</option>
                    <option value="Staff">Staff</option>
                  </Field>
                </div>

                <div className="form-group">
                  <label htmlFor="username">Username:</label>
                  <Field
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    className="input-field"
                  />
                  <ErrorMessage name="username" component="div" className="error-message" />
                </div>

                {userType === 'Client' && (
                  <div className="form-group">
                    <label htmlFor="accountNumber">Account Number:</label>
                    <Field
                      type="text"
                      id="accountNumber"
                      name="accountNumber"
                      placeholder="Enter your account number"
                      className="input-field"
                    />
                    <ErrorMessage name="accountNumber" component="div" className="error-message" />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="password">Password:</label>
                  <Field
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    className="input-field"
                  />
                  <ErrorMessage name="password" component="div" className="error-message" />
                </div>

                {errors.serverError && <p className="error-message server-error">{errors.serverError}</p>}

                <div className="button-group">
                  <button type="submit" className="login-button" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </button>
                  <button type="button" className="back-button" onClick={handleBackClick}>
                    Back to Welcome
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default Login;

/* This code was adapted from various tutorials on React, Formik, and Yup for form handling and validation */
// This method was adapted from the Express documentation on routing and various tutorials on transaction management
// https://expressjs.com/en/guide/routing.html
// Express Documentation
// https://expressjs.com/
