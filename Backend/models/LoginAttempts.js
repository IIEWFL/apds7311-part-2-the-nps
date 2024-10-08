import mongoose from 'mongoose';

const loginAttemptSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true, index: true}, // Add index for faster queries 
    ipAddress: { type: String, required: true, immutable: true, index: true}, // Add index for faster queries
    successfulLogin: { type: Boolean, required: true, immutable: true,index: true}, // Add index for faster queries
    timeStamp: { type: Date, default: Date.now, immutable: true,expires: '30d'} // Automatically delete documents after 30 days
    
})

// Create a compound index for common query patterns
loginAttemptSchema.index({ username: 1, timeStamp: -1 });

export default mongoose.model('LoginAttempt', loginAttemptSchema);