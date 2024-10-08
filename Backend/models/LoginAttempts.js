import mongoose from 'mongoose';

const loginAttemptSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true},  
    ipAddress: { type: String, required: true, immutable: true}, 
    successfulLogin: { type: Boolean, required: true, immutable: true}, 
    timeStamp: { type: Date, default: Date.now, immutable: true,expires: '30d'} // Automatically delete documents after 30 days
    
});

export default mongoose.model('LoginAttempt', loginAttemptSchema);