import express from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';
import Joi from 'joi';

const router = express.Router();

// Helper function for SWIFT code validation
const validateSwiftCode = (swiftCode) => {
    const swiftCodeRegex = /^[A-Z0-9]{8,11}$/; 
    return typeof swiftCode == 'string' && swiftCodeRegex.test(swiftCode);
};

// Helper function to sanitize and validate MongoDB ID
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Helper function to sanitize account numbers
const sanitizeAccountNumber = (accountNumber) => {
    return typeof accountNumber === 'string' ? accountNumber.toString().trim() : '';
};

// Define a Joi schema for input validation
const transactionSchema = Joi.object({
    fromAccountNumber: Joi.string().alphanum().min(8).max(12).trim().required(),
    toAccountNumber: Joi.string().alphanum().min(8).max(12).trim().required(),
    amount: Joi.number().positive().precision(2).required(),
    currency: Joi.string().length(3).uppercase().trim().required(), // Ensures it’s an ISO currency code
    swiftCode: Joi.string().regex(/^[A-Z0-9]{8,11}$/).required(),
    paymentMethod: Joi.string().valid('bank_transfer', 'credit_card', 'paypal').required(),
});

// Get all transactions (for employees)
router.get('/get', authMiddleware, async (req, res) => {
    try {
        const transactions = await Transaction.find({ status: 'pending' });
        console.log(`Retrieved ${transactions.length} pending transactions`);
        res.status(200).json({ transactions });
    } catch (err) {
        console.error('Error fetching transactions:', err.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Create a new transaction (for customers)
router.post('/create', authMiddleware, async (req, res) => {

    // Validate input using Joi
    const { error } = transactionSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: 'Invalid input', details: error.details });
    }

    const { fromAccountNumber, toAccountNumber, amount, currency, swiftCode, paymentMethod } = req.body;

    // Sanitize user input (even after Joi validation)
    const sanitizedFromAccount = fromAccountNumber.trim();
    const sanitizedToAccount = toAccountNumber.trim();
    const sanitizedCurrency = currency.toUpperCase().trim();
    const sanitizedSwiftCode = swiftCode.trim();

    // Validate SWIFT code

    if (!validateSwiftCode(swiftCode)) {
        return res.status(400).json({ message: 'Invalid SWIFT code' });
    }

    try {

        // Use strict equality comparison in your query with sanitized inputs
        const fromUser = await User.findOne({
            accountNumber: { $eq: sanitizedFromAccount },
            active: true // Assuming you only want active accounts
        }).lean(); // Use .lean() to return plain JavaScript object

        const toUser = await User.findOne({
            accountNumber: { $eq: sanitizedToAccount },
            active: true
        }).lean();

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
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid transaction ID' });
        }

        const transaction = await Transaction.findOneAndUpdate(
            { 
                _id: req.params.id,
                status: { $ne: 'completed' }
            },
            { $set: { status: 'verified' } },
            { new: true }
        ).lean();

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json({ message: 'Transaction verified and ready to submit to SWIFT' });
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

