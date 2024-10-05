import mongoose from 'mongoose';

// Define the User schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true }, // Removed unique: true for fullName as names may not be unique
    idNumber: { type: String, required: true, unique: true, trim: true },
    accountNumber: { type: String, required: true, unique: true }, // Ensure accountNumber is unique
    password: { type: String, required: true }, // Password should be hashed before saving
});

// Export the User model
export default mongoose.model('User', UserSchema);
