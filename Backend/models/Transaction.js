import mongoose from 'mongoose';

const TRANSACTION_TYPES = ['deposit', 'withdrawal'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'ZAR', 'CAD', 'CHF', 'CNY'];
const PAYMENT_METHODS = ['credit_card', 'debit_card', 'bank_transfer', 'paypal'];
const STATUSES = ['pending', 'completed', 'failed'];

const TransactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    type: {
        type: String,
        enum: TRANSACTION_TYPES,
        required: true,
        index: true
    },
    currency: {
        type: String,
        enum: CURRENCIES,
        required: true,
        index: true
    },
    conversionRate: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: PAYMENT_METHODS,
        required: true
    },
    transactionDate: {
        type: Date,
        default: Date.now,
        index: true
    },
    status: {
        type: String,
        enum: STATUSES,
        default: 'pending',
        index: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index for common query patterns
TransactionSchema.index({ fromAccount: 1, transactionDate: -1 });
TransactionSchema.index({ toAccount: 1, transactionDate: -1 });

// Virtual for total amount in base currency
TransactionSchema.virtual('totalAmount').get(function() {
    return this.amount * this.conversionRate;
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

export default Transaction;