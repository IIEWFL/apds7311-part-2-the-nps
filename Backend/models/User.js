import mongoose from'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, unique: true, trim: true },
    idNumber: { type: String, required: true, unique: true, trim: true },
    accountNumber: { type: String, required: true, unique: true }, // Ensure accountNumber is unique
    password: { type: String, required: true },
  });


  export default mongoose.model('User', UserSchema);