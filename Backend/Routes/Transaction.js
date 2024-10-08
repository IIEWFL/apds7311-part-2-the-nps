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

// Get all transactions (for employees)
router.get('/get', authMiddleware, async (req, res) => {
    try {
        const transactions = await Transaction.find({ status: 'pending' });
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

    if (!fromAccountNumber || !toAccountNumber || !amount || !currency || !swiftCode || !paymentMethod) {
        return res.status(400).json({ message: 'Fill in all fields' });
    }

    if (!validateSwiftCode(swiftCode)) {
        return res.status(400).json({ message: 'Invalid SWIFT code' });
    }

    try {
        const fromUser = await User.findOne({ accountNumber: fromAccountNumber });
        const toUser = await User.findOne({ accountNumber: toAccountNumber });

        if (!fromUser || !toUser) {
            const errorMessage = !fromUser && !toUser ? 'Both account numbers not found' :
                                 !fromUser ? 'From account number not found' :
                                 'To account number not found';
            return res.status(404).json({ message: errorMessage });
        }

        const transaction = new Transaction({
            fromAccount: fromUser._id,
            toAccount: toUser._id,
            fromAccountNumber,
            toAccountNumber,
            amount,
            currency,
            swiftCode,
            paymentMethod
            
        });

        await transaction.save();
        res.status(201).json({ message: 'Transaction created successfully', transaction });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Method to update the status of a transaction (e.g., approve)
router.put('/status/:id', authMiddleware, async (req, res) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }

    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Update the status of the transaction
        transaction.status = status;
        await transaction.save();

        res.status(200).json({ message: `Transaction status updated to ${status}`, transaction });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Employees verify and submit transactions to SWIFT
router.put('/verify/:id', authMiddleware, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        transaction.status = 'verified';
        await transaction.save();
        res.status(200).json({ message: 'Transaction verified and ready to submit to SWIFT', transaction });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Employees finalize submission to SWIFT
router.post('/submit/:id', authMiddleware, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction || transaction.status !== 'verified') {
            return res.status(400).json({ message: 'Transaction not found or not verified' });
        }

        transaction.status = 'completed';
        await transaction.save();
        res.status(200).json({ message: 'Transaction successfully submitted to SWIFT', transaction });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Get all transactions for the logged-in user
router.get('/my-transactions', authMiddleware, async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [
                { fromAccount: req.user.id },
                { toAccount: req.user.id }
            ]
        }).populate('fromAccount toAccount', 'accountNumber name');

        if (!transactions || transactions.length === 0) {
            return res.status(404).json({ message: 'No transactions found' });
        }

        res.status(200).json({ transactions });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

export default router;
