import mongoose from 'mongoose';

// Define the loginAttempt schema
const loginAttemptSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true }, 
    ipAddress: { type: String, required: true, immutable: true },
    successfulLogin: { type: Boolean, required: true, immutable: true },
    timeStamp: { type: Date, default: Date.now, immutable: true }
});

// Export the loginAttempt model
export default mongoose.model('LoginAttempt', loginAttemptSchema);

// This method was adapted from the Mongoose documentation on defining schemas
// https://mongoosejs.com/docs/guide.html