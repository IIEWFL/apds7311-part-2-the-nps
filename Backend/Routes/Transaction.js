import express from 'express';
import bcrypt from 'bcrypt'; // In case you need it for other routes
import Transaction from '../models/Transaction.js'; // Assuming Transaction model is in the models folder
import User from '../models/User.js';
import axios from 'axios';
import authMiddleware from '../middleware/authMiddleware.js'; // Assuming you have a token authentication middleware

const router = express.Router();

// Functions to get the conversion rate from the external API
const getConversionRate = async (fromCurrency, toCurrency) => {
    try {
        const response = await axios.get(`https://api.currencyapi.com/v3/latest?apikey=cur_live_lt1u83t3ZDIfNrboLKh2Z1mS3KERiP1OP4xV48hG&base_currency=${fromCurrency}`);

        // Check if the rates data is available in the response
        const rates = response.data.data;  // Updated to access response structure correctly

        if (!rates || !rates[toCurrency]) {
            throw new Error(`Conversion rate for ${toCurrency} not found.`);
        }

        return rates[toCurrency].value;  // Correctly access the conversion rate
    } catch (error) {
        console.error('Error fetching conversion rate:', error.message);
        throw new Error('Could not retrieve conversion rate.');
    }
};

// Get all transactions
router.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.status(200).json({ transactions });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Create a new transaction (Transfer)
router.post('/transfer', authMiddleware, async (req, res) => {
    try {
        const { fromAccount, toAccount, amount, currency, targetCurrency, paymentMethod } = req.body;

        // Find users by account numbers
        const fromAccountUser = await User.findOne({ accountNumber: fromAccount });
        const toAccountUser = await User.findOne({ accountNumber: toAccount });

        if (!fromAccountUser || !toAccountUser) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Fetch conversion rate
        const conversionRate = await getConversionRate(currency, targetCurrency);
        
        // Calculate converted amount
        const convertedAmount = amount * conversionRate;

        // Create transaction
        const transaction = new Transaction({
            fromAccount: fromAccountUser._id,
            toAccount: toAccountUser._id,
            amount: convertedAmount, // Store the converted amount in the transaction
            currency,
            targetCurrency, // Save the target currency
            conversionRate, // Store the conversion rate
            paymentMethod,
            status: 'pending' // Default status
        });

        await transaction.save();
        res.status(201).json({
            message: `Amount to be deposited: ${convertedAmount.toFixed(2)} ${targetCurrency}`,
            convertedAmount: convertedAmount.toFixed(2),
            conversionRate,
            transaction
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});


// Get transaction by ID
router.get('/:id',authMiddleware,  async (req, res) => {
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
router.put('/:id',authMiddleware, async (req, res) => {
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
router.delete('/:id',authMiddleware, async (req, res) => {
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
