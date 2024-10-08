import express from 'express';
import Transaction from '../models/Transaction.js'; 
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper function for SWIFT code validation
const validateSwiftCode = (swiftCode) => {
    const swiftCodeRegex = /^[A-Z0-9]{8,11}$/; 
    return swiftCodeRegex.test(swiftCode);
};

// Helper function to validate account number format
const validateAccountNumber = (accountNumber) => {
    // Assuming account numbers are alphanumeric and have a specific length
    const accountNumberRegex = /^[A-Za-z0-9]{8,12}$/;
    return accountNumberRegex.test(accountNumber);
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
router.post('/create', authMiddleware, async (req, res) => {
    const { fromAccountNumber, toAccountNumber, amount, currency, swiftCode, paymentMethod } = req.body;

    // Input validation
    if (!fromAccountNumber || !toAccountNumber || !amount || !currency || !swiftCode || !paymentMethod) {
        console.warn('Missing fields in request:', req.body);
        return res.status(400).json({ message: 'Fill in all fields' });
    }

    // Validate SWIFT code
    if (!validateSwiftCode(swiftCode)) {
        console.warn('Invalid SWIFT code:', swiftCode);
        return res.status(400).json({ message: 'Invalid SWIFT code' });
    }
    // Validate account number formats
    if (!validateAccountNumber(fromAccountNumber) || !validateAccountNumber(toAccountNumber)) {
        console.warn('Invalid account number format');
        return res.status(400).json({ message: 'Invalid account number format' });
    }

    try {
        // Find users by account numbers
        // Use strict equality comparison and type checking
        const fromUser = await User.findOne({
            accountNumber: { $eq: fromAccountNumber },
            active: true // Assuming we only want active accounts
        }).select('_id accountNumber name').lean();

        const toUser = await User.findOne({
            accountNumber: { $eq: toAccountNumber },
            active: true
        }).select('_id accountNumber name').lean();

        console.log('From User:', fromUser?.accountNumber);
        console.log('To User:', toUser?.accountNumber);

        // Check if both users were found
        if (!fromUser || !toUser) {
            const errorMessage = !fromUser && !toUser ? 'Both account numbers not found' :
                                 !fromUser ? 'From account number not found' :
                                 'To account number not found';
            console.warn(errorMessage, { fromAccountNumber, toAccountNumber });
            return res.status(404).json({ message: errorMessage });
        }
// Create transaction
const transaction = new Transaction({
    fromAccount: fromUser._id,
    toAccount: toUser._id,
    fromAccountNumber,
    toAccountNumber,
    amount: amount,
    currency: currency,
    swiftCode: swiftCode,
    paymentMethod: paymentMethod, 
    
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