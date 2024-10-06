import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import https from 'https'; // HTTPS module
import morgan from 'morgan';
import fs from 'fs'; // File system module
import User from './models/User.js'; // User model (ensure file paths include the extension)
import Transaction from '../models/Transaction.js'; // Transaction model
import jwt from 'jsonwebtoken'; // JWT for session management
import { body, validationResult } from 'express-validator'; // Input validation

import authRoutes from './Routes/auth.js';
import transactRoutes from './Routes/Transaction.js';



// Correctly reference the 'server.key' and 'server.cert' (if applicable) inside the 'Keys' folder
const key = fs.readFileSync('./Keys/server.key');
const cert = fs.readFileSync('./Keys/server.cert'); // if you have a certificate file as well



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Allows the server to parse JSON bodies
app.use(helmet()) // Extra layer of security to your API
app.use(morgan('combined')); // request logger middleware


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', transactRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Welcome to the International Payments Portal API');
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.sendStatus(403);
    }
    req.user = user;
    console.log('Token verified successfully:', user);
    next();
  });
};

// Logout Route
app.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logout successful. Please remove the token and redirect to the login screen.' });
});

// Create a new transaction
app.post('/transfer', authenticateToken, [
  body('fromAccountNumber').notEmpty().withMessage('From account number is required'),
  body('toAccountNumber').notEmpty().withMessage('To account number is required'),
  body('amount').isNumeric().withMessage('Amount must be a number').notEmpty().withMessage('Amount is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fromAccountNumber, toAccountNumber, amount } = req.body;

  try {
    // Find users
    const fromAccount = await User.findOne({ accountNumber: fromAccountNumber });
    const toAccount = await User.findOne({ accountNumber: toAccountNumber });

    if (!fromAccount || !toAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Create transaction
    const transaction = new Transaction({
      fromAccount: fromAccount._id,
      toAccount: toAccount._id,
      amount: amount,
    });

    await transaction.save();

    res.status(201).json({ message: 'Transaction created', transaction });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transaction history for a user
app.get('/history/:accountNumber', authenticateToken, async (req, res) => {
  const { accountNumber } = req.params;

  try {
    // Find user
    const user = await User.findOne({ accountNumber });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find transactions involving this user
    const transactions = await Transaction.find({
      $or: [{ fromAccount: user._id }, { toAccount: user._id }],
    }).populate('fromAccount toAccount', 'accountNumber fullName');

    res.status(200).json({ transactions });
  } catch (error) {
    console.error('History retrieval error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// HTTPS server setup
const options = {
  key: fs.readFileSync('./Keys/server.key'), // Corrected path to the private key
  cert: fs.readFileSync('./Keys/server.cert') // Corrected path to the certificate
};

// Start the server
// Start the server
https.createServer({ key: key, cert: cert }, app).listen(PORT, () => {
  console.log(`Https Server is running on port ${PORT}`);
});
