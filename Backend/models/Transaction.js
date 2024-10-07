import mongoose from'mongoose';

const TransactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: [0, 'Amount must be a positive number'], // Ensure amount is positive
    },
    type: {
        type: String,
        enum: ['deposit', 'withdrawal'],
        required: true
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'ZAR', 'CAD', 'CHF', 'CNY'],
        required: true,
        match: /^[A-Z]{3}$/, // Ensure currency is a 3-letter uppercase code
    },
    conversionRate: {
        type: Number, // To store the exchange rate at the time of transaction
        required: true,
        min: [0, 'Conversion rate must be a positive number'], // Ensure conversion rate is positive
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'bank_transfer', 'paypal'],
        required: true
    },
    transactionDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
});
export default mongoose.model('Transaction', TransactionSchema);