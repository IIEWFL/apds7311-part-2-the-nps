import mongoose from 'mongoose';

// Define an array of SWIFT codes with their corresponding bank names
const SWIFT_CODES = [
    { bank: 'Absa Bank', code: 'ABSAZAJJ' },
    { bank: 'Standard Bank', code: 'SBZAZAJJ' },
    { bank: 'First National Bank (FNB)', code: 'FIRNZAJJ' },
    { bank: 'Nedbank', code: 'NEDSZAJJ' },
    { bank: 'Capitec Bank', code: 'CABLZAJJ' },
    { bank: 'Investec Bank', code: 'INVZZAJJ' },
    { bank: 'African Bank', code: 'AFSIZAJJ' },
    { bank: 'HSBC Bank', code: 'HSBCZAJJ' },
    { bank: 'Rand Merchant Bank', code: 'RMBKZAJJ' },
 
];

// Define the transaction schema
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
        min: [0, 'Amount must be a positive number'],
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'ZAR', 'CAD', 'CHF', 'CNY'],
        required: true,
        match: /^[A-Z]{3}$/,
    },
    swiftCode: {
        type: String,
        required: true,
        enum: SWIFT_CODES.map(swift => swift.code), 
        match: /^[A-Z0-9]{8,11}$/, 
    },
    paymentMethod: {
        type: String,
       // enum: ['Credit Card', 'Debit Card', 'Bank Transfer', 'Paypal'],
        required: true,
    },
    status:{
        type: String,
        required: true

    }

    
});

// Export the transaction model
export default mongoose.model('Transaction', TransactionSchema);

// This method was adapted from the Mongoose documentation on defining schemas
// https://mongoosejs.com/docs/guide.html