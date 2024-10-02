const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Ensure consistency in the bcrypt library

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    idNumber: { type: String, required: true },
    accountNumber: { type: String, required: true, unique: true }, // Ensure accountNumber is unique
    password: { type: String, required: true },
  });
  
  // Hash password before saving
  UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
      return next(); // If the password hasn't been modified, move to the next middleware
    }
    try {
      // Hash the password with 10 salt rounds
      this.password = await bcrypt.hash(this.password, 10);
      next();
    } catch (error) {
      return next(error); // Handle any error that occurs during hashing
    }
  });
  
  // Method to compare password
  UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password); // Compare candidate password with hashed password
  };
  
  module.exports = mongoose.model('User', UserSchema); 