import mongoose from 'mongoose';

// Define the User schema
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[a-zA-Z0-9_]{3,30}$/, // Allows alphanumeric and underscores, 3-30 characters
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        match: /^[a-zA-Z\s]+$/, // Allows letters and spaces only
    },
    idNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[0-9]{13}$/, // Example: 13-digit South African ID number format
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true,
        match: /^[0-9]{10,12}$/, // Example: 10 to 12 digits for account numbers
    },
    password: {
        type: String,
        required: true,
        match: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, // Minimum 8 characters, at least one letter and one number
    },
});
// Export the User model
export default mongoose.model('User', UserSchema);
