import mongoose from'mongoose';

const loginAttemptSchema = new mongoose.Schema({
    accountNumber: { type: String, required: true, unique: true },
    ipAddress: {type: String, required: true, immutable: true},
    successfulLogin: {type: Boolean, required: true, immutable: true},
    timeStamp: {type: Date, default: Date.now, immutable: true}
})

export default mongoose.model('LoginAttempt', loginAttemptSchema); 