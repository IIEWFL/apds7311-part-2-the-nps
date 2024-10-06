import mongoose from 'mongoose';

const loginAttemptSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true }, // Remove unique: true
    ipAddress: { type: String, required: true, immutable: true },
    successfulLogin: { type: Boolean, required: true, immutable: true },
    timeStamp: { type: Date, default: Date.now, immutable: true }
});

export default mongoose.model('LoginAttempt', loginAttemptSchema);
