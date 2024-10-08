import express from 'express';
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
router.get('/', authMiddleware, async (req, res) => {
    try {
        const transactions = await Transaction.find({ 
            status: 'pending' 
        }).select('-__v').lean();
        
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
        console.warn('Invalid SWIFT code:', swiftCode);
        return res.status(400).json({ message: 'Invalid SWIFT code' });
    }
    
    try {
        // Use strict equality comparison with sanitized inputs
        const fromUser = await User.findOne({
            $and: [
                { accountNumber: { $eq: sanitizedFromAccount } },
                { active: { $eq: true } }
            ]
        }).select('_id accountNumber').lean();
        
        const toUser = await User.findOne({
            $and: [
                { accountNumber: { $eq: sanitizedToAccount } },
                { active: { $eq: true } }
            ]
        }).select('_id accountNumber').lean();

        if (!fromUser || !toUser) {
            return res.status(404).json({ 
                message: !fromUser && !toUser ? 'Both account numbers not found' :
                         !fromUser ? 'From account number not found' :
                         'To account number not found'
            });
        }

        // Create transaction
        const transaction = new Transaction({
            fromAccount: fromUser._id,
            toAccount: toUser._id,
            fromAccountNumber: sanitizedFromAccount,
            toAccountNumber: sanitizedToAccount,
            amount: amount,
            currency: sanitizedCurrency,
            swiftCode: sanitizedSwiftCode,
            paymentMethod: paymentMethod.toString().trim(), 
            
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
        console.error('Error verifying transaction:', err.message);
        res.status(500).json({ message: 'Internal Server Error' });
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
        const userId = req.user.id;
        if (!isValidObjectId(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const transactions = await Transaction.find({
            $or: [
                { fromAccount: userId },
                { toAccount: userId }
            ]
        })
        .select('-__v')
        .populate('fromAccount toAccount', 'accountNumber name')
        .lean();

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