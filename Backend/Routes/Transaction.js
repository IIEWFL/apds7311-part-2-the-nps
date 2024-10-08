import express from 'express';
import bcrypt from 'bcrypt'; // In case you need it for other routes
import Transaction from '../models/Transaction.js'; // Assuming Transaction model is in the models folder
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Assuming you have a token authentication middleware

const router = express.Router();

// Get all transactions
router.get('/', limiter, async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.status(200).json({ transactions });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Create a new transaction (Transfer)
router.post('/', limiter, authMiddleware, async (req, res) => {
    
        const { fromAccountNumber, toAccountNumber, amount } = req.body;

        // Input validation
        if (!fromAccountNumber || !toAccountNumber || !amount || isNaN(amount)) {
            return res.status(400).json({ message: 'Fill in all fields' });
        }
try {
        // Find users by account numbers
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
        res.status(201).json({ message: 'Transaction created successfully', transaction });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Get transaction by ID
router.get('/:id', limiter,authMiddleware,  async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
         
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        
        res.json(transaction);
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Update a transaction by ID
router.put('/:id', limiter,authMiddleware, async (req, res) => {
    try {
        const { fromAccountNumber, toAccountNumber, amount } = req.body;

        // Find the transaction by ID
        let transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Update fields if provided
        if (fromAccountNumber) {
            const fromAccount = await User.findOne({ accountNumber: fromAccountNumber });
            if (!fromAccount) return res.status(404).json({ message: 'From account not found' });
            transaction.fromAccount = fromAccount._id;
        }

        if (toAccountNumber) {
            const toAccount = await User.findOne({ accountNumber: toAccountNumber });
            if (!toAccount) return res.status(404).json({ message: 'To account not found' });
            transaction.toAccount = toAccount._id;
        }

        if (amount && !isNaN(amount)) transaction.amount = amount;

        await transaction.save();
        res.status(200).json({ message: 'Transaction updated successfully', transaction });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Delete a transaction by ID
router.delete('/:id', limiter,authMiddleware, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        await transaction.findByIdAndDelete(req.params.id);
        res.json({ message: 'Transaction deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

export default router;
