import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './Register.css'; // Import your CSS file for styling

// For more information, visit: https://reactrouter.com/en/main/start/overview
// Additional reference: https://ui.dev/react-router-tutorial

// Validation schema using Yup
const validationSchema = Yup.object({
  username: Yup.string()
    .matches(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers.')
    .required('Username is required'),
  fullName: Yup.string()
    .required('Full Name is required'),
  accountNumber: Yup.string()
    .matches(/^\d+$/, 'Account Number must be numeric')
    .required('Account Number is required'),
  idNumber: Yup.string()
    .matches(/^\d+$/, 'ID Number must be numeric')
    .required('ID Number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 'Password must contain at least one letter and one number.')
    .required('Password is required'),
});

function Register() {
  const navigate = useNavigate(); // Hook for navigating

  const handleRegisterClick = async (values, { setSubmitting, setErrors }) => {
    try {
      // Make the POST request to the registration API
      await axios.post('https://localhost:5000/api/auth/register', {
        username: values.username,
        fullName: values.fullName,
        idNumber: values.idNumber,
        accountNumber: values.accountNumber,
        password: values.password,
      });

      // Show a success alert
      alert('Registration successful.');

      // Redirect to login page after successful registration
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err); // Log the error for debugging
      if (err.response) {
        setErrors({ serverError: err.response.data.message }); // Set server error message
      } else {
        setErrors({ serverError: 'Something went wrong. Please try again.' + err }); // Set generic error message
      }
    } finally {
      setSubmitting(false); // Stop the form submission state
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h1 className="register-title">Register</h1>
        <p className="register-description">Please fill in your details below.</p>

        <Formik
          initialValues={{ username: '', fullName: '', accountNumber: '', idNumber: '', password: '' }} // Initial form values
          validationSchema={validationSchema} // Validation schema for form fields
          onSubmit={handleRegisterClick} // Form submission handler
        >
          {({ isSubmitting, errors }) => (
            <Form>
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

              <div className="form-group">
                <label htmlFor="fullName">Full Name:</label>
                <Field
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  className="input-field"
                />
                <ErrorMessage name="fullName" component="div" className="error-message" />
              </div>

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

              <div className="form-group">
                <label htmlFor="idNumber">ID Number:</label>
                <Field
                  type="text"
                  id="idNumber"
                  name="idNumber"
                  placeholder="Enter your ID number"
                  className="input-field"
                />
                <ErrorMessage name="idNumber" component="div" className="error-message" />
              </div>

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

              {errors.serverError && <p className="error-message">{errors.serverError}</p>}

              <div className="button-group">
                <button type="submit" className="register-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Registering...' : 'Register'}
                </button>
                <button type="button" className="back-button" onClick={() => navigate('/')}>
                  Back to Welcome
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Register;

/* This code was adapted from various tutorials on React, Formik, and Yup for form handling and validation */
// This method was adapted from the Express documentation on routing and various tutorials on transaction management
// https://expressjs.com/en/guide/routing.html
// Express Documentation
// https://expressjs.com/
