import mongoose from'mongoose';
//const bcrypt = require('bcryptjs'); // Ensure consistency in the bcrypt library

const UserSchema = new mongoose.Schema({
    username: { 
      type: String, 
      required: true },
    fullName: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true },
    idNumber: {
      type: String,
      required: [true, "ID number is required"],
      unique: true,
      trim: true,
      minlength: [7, "ID number must be at least 6 characters long"],
      maxlength: [13, "ID number cannot be more than 13 characters long"]
  },
    accountNumber: {
      type: String,
      required: [true, "Account number is required"],
      unique: true,
      trim: true,
      min: [10000000, "Account number should be at least 8 digits long"],
      max: [9999999999999999, "Account number should not be more than 16 digits long"]
  },
  password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password should be at least 8 characters long"]
  }
  });


  export default mongoose.model('User', UserSchema); 
