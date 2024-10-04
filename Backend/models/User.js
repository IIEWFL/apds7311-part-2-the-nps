import mongoose from'mongoose';
//const bcrypt = require('bcryptjs'); // Ensure consistency in the bcrypt library

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    fullName: { type: String, required: true, unique: true, trim: true },
    idNumber: { type: String, required: true, unique: true, trim: true },
    accountNumber: { type: String, required: true, unique: true }, // Ensure accountNumber is unique
    password: { type: String, required: true },
  });


  export default mongoose.model('User', UserSchema); 
