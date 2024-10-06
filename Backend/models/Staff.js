import mongoose from 'mongoose';

// Define the Staff schema
const StaffSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true }, // Removed unique: true for fullName as names may not be unique
    password: { type: String, required: true }, // Password should be hashed before saving
});

// Export the Staff model
export default mongoose.model('Staff', StaffSchema);
