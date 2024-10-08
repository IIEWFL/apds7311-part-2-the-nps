import express from 'express';
import Transaction from '../models/Transaction.js'; 
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

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
    const { fromAccountNumber, toAccountNumber, amount, currency, swiftCode, paymentMethod } = req.body;

    // Input validation
    if (!fromAccountNumber || !toAccountNumber || !amount || !currency || !swiftCode || !paymentMethod) {
        console.warn('Missing fields in request:', req.body);
        return res.status(400).json({ message: 'Fill in all fields' });
    }

    // Sanitize inputs
    const sanitizedFromAccount = sanitizeAccountNumber(fromAccountNumber);
    const sanitizedToAccount = sanitizeAccountNumber(toAccountNumber);
    
    // Validate amount
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
    }

    // Validate SWIFT code
    if (!validateSwiftCode(swiftCode)) {
        console.warn('Invalid SWIFT code:', swiftCode);
        return res.status(400).json({ message: 'Invalid SWIFT code' });
    }
    
    try {
        // Find users by account numbers using sanitized inputs
        const fromUser = await User.findOne({ 
            accountNumber: sanitizedFromAccount 
        }).select('_id accountNumber').lean();
        
        const toUser = await User.findOne({ 
            accountNumber: sanitizedToAccount 
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
            currency: currency.toString().trim(),
            swiftCode: swiftCode.toString().trim(),
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