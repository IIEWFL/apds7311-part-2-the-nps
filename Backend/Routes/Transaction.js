import express from 'express';
import Transaction from '../models/Transaction.js'; 
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Function to sanitize account number (example)
function sanitizeAccountNumber(accountNumber) {
    return accountNumber.replace(/[^a-zA-Z0-9]/g, ''); // Allow only alphanumeric characters
}

// Helper function for SWIFT code validation
const validateSwiftCode = (swiftCode) => {
    const swiftCodeRegex = /^[A-Z0-9]{8,11}$/; 
    return swiftCodeRegex.test(swiftCode);
};

// Get all transactions (for employees)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const transactions = await Transaction.find({ status: 'pending' }); // Show only pending transactions
        console.log(`Retrieved ${transactions.length} pending transactions`);
        res.status(200).json({ transactions });
    } catch (err) {
        console.error('Error fetching transactions:', err.message);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Create a new transaction (for customers)
router.post('/', authMiddleware, async (req, res) => {
    const { fromAccountNumber, toAccountNumber, amount, currency, swiftCode } = req.body;

    // Input validation
    if (!fromAccountNumber || !toAccountNumber || !amount || !currency || !swiftCode ) {
        console.warn('Missing fields in request:', req.body);
        return res.status(400).json({ message: 'Fill in all fields' });
    }

    // Validate SWIFT code
    if (!validateSwiftCode(swiftCode)) {
        console.warn('Invalid SWIFT code:', swiftCode);
        return res.status(400).json({ message: 'Invalid SWIFT code' });
    }

    // Sanitize account numbers
    const sanitizedFromAccountNumber = sanitizeAccountNumber(fromAccountNumber);
    const sanitizedToAccountNumber = sanitizeAccountNumber(toAccountNumber);

    // Additional validation for account numbers (e.g., length, format)
    if (!isValidAccountNumber(sanitizedFromAccountNumber) || !isValidAccountNumber(sanitizedToAccountNumber)) {
        console.warn('Invalid account numbers:', { fromAccountNumber, toAccountNumber });
        return res.status(400).json({ message: 'Invalid account numbers' });
    }

    try {
        // Find users by account numbers
        const fromAccount = await User.findOne({ accountNumber: sanitizedFromAccountNumber });
        const toAccount = await User.findOne({ accountNumber: sanitizedToAccountNumber });

        if (!fromAccount || !toAccount) {
            console.warn('Account not found:', { fromAccountNumber: sanitizedFromAccountNumber, toAccountNumber: sanitizedToAccountNumber });
            return res.status(404).json({ message: 'Account not found' });
        }

        // Create transaction
        const transaction = new Transaction({
            fromAccount: fromAccount._id,
            toAccount: toAccount._id,
            amount: amount,
            currency: currency,
            swiftCode: swiftCode,
            paymentMethod: 'bank_transfer', 
            
        });

        await transaction.save();
        console.log('Transaction created successfully:', transaction);
        res.status(201).json({ message: 'Transaction created successfully', transaction });
    } catch (err) {
        console.error('Error creating transaction:', err.message);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Employees verify and submit transactions to SWIFT
router.put('/verify/:id', authMiddleware, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            console.warn('Transaction not found:', req.params.id);
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Verify the transaction details
        transaction.status = 'verified';
        await transaction.save();
        console.log('Transaction verified:', transaction);

        res.status(200).json({ message: 'Transaction verified and ready to submit to SWIFT', transaction });
    } catch (err) {
        console.error('Error verifying transaction:', err.message);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Employees finalize submission to SWIFT
router.post('/submit/:id', authMiddleware, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction || transaction.status !== 'verified') {
            console.warn('Transaction not found or not verified:', req.params.id);
            return res.status(400).json({ message: 'Transaction not found or not verified' });
        }

        // Submit to SWIFT (placeholder for actual SWIFT submission logic)
        transaction.status = 'completed';
        await transaction.save();
        console.log('Transaction submitted to SWIFT:', transaction);

        res.status(200).json({ message: 'Transaction successfully submitted to SWIFT', transaction });
    } catch (err) {
        console.error('Error submitting transaction to SWIFT:', err.message);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Get all transactions for the logged-in user
router.get('/my-transactions', authMiddleware, async (req, res) => {
    try {
        // Find all transactions where the logged-in user is either the sender or recipient
        const transactions = await Transaction.find({
            $or: [
                { fromAccount: req.user.id },
                { toAccount: req.user.id }
            ]
        }).populate('fromAccount toAccount', 'accountNumber name'); // Populates accountNumber and name for the involved users

        if (!transactions || transactions.length === 0) {
            console.log('No transactions found for user:', req.user.id);
            return res.status(404).json({ message: 'No transactions found' });
        }

        res.status(200).json({ transactions });
    } catch (err) {
        console.error('Error retrieving transactions:', err.message);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

export default router;


// This method was adapted from the Express documentation on routing and various tutorials on transaction management
// https://expressjs.com/en/guide/routing.html
// Express Documentation
// https://expressjs.com/