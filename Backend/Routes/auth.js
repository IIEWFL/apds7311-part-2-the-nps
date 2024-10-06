import express, { Router } from 'express';
import bcrypt from 'bcrypt';
const bcrypt = require('bcryptjs'); // Ensure consistency in the bcrypt library
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bruteForce from '../middleware/bruteForceProtectionMiddleware.js';
import loginAttemptLogger from '../middleware/loginAttemptMiddleware.js';
import dotenv from 'dotenv'; // Environment variables

// Load environment variables from .env file
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Registration Route
router.post('/register', async (req, res) => {
    console.log('Register route hit');
    try {
        const { username, fullName, idNumber, accountNumber, password } = req.body;

        // Validate user input
        if (!username || !fullName || !idNumber || !accountNumber || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ accountNumber });
        if (existingUser) {
            return res.status(400).json({ message: 'User Account Number already exists' });
        }

        // Trim the password to ensure it's not empty or has extra spaces
        const trimmedPassword = password.trim();
        if (!trimmedPassword) {
            return res.status(400).json({ message: 'Password cannot be empty or whitespace' });
        }

        // Log the trimmed password for debugging
        console.log('Trimmed Password:', trimmedPassword);

        // Hash Password 
        const salt = 10;
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('Hashed Password:', hashedPassword); // Log the hashed password for debugging

        // Create new user
        const User = new User({
            username,
            fullName,
            idNumber,
            accountNumber,
            password: hashedPassword
        });

        await User.save();

        return res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
        console.error('Error during registration:', err); // Log the error for debugging
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});
  // Login Route
  /*router.post('/login',bruteForce.prevent, loginAttemptLogger , async (req, res) => {
    try {
        const { username, accountNumber, password } = req.body;
  
        console.log('Login attempt:', req.body); // Log the incoming request body
  
        // Find the user by account number
        const user = await User.findOne({ accountNumber });
        if (!user) {
            console.log('User not found'); // Log for debugging
            return res.status(404).json({ message: 'User Account Not Found' });
        }
  
        console.log('User found:', user); // Log the user retrieved from the database
  
        // Attempt to compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password); // Ensure 'user.password' is correct
  
        console.log('Password comparison:', { providedPassword: password, storedPasswordHash: user.password });
    
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
  
        // Create a JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
  
        // Login successful
        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});*/


//  Login Route
router.post('/login', bruteForce.prevent, loginAttemptLogger, async (req, res) => {
  try {
      const { idNumber, accountNumber, password } = req.body;

      console.log('Login attempt:', req.body); // Log the incoming request body

      // Find the user by account number
      const user = await User.findOne({ idNumber,accountNumber });
      if (!user) {
          console.log('User not found'); // Log for debugging
          return res.status(404).json({ message: 'User Account Not Found' });
      };

      console.log('User found:', user); // Log the user retrieved from the database

      // Trim the entered password
      const trimmedPassword = password.trim();

      // Check if the password is correct
      const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password);
      console.log("Is Password Valid:", isPasswordValid);

      // If password is not valid, return an error
      if (!isPasswordValid) {
          return res.status(400).json({ message: "Invalid credentials" });
      };

      // If password is valid but using an old hash format, update it
      if (user.password.startsWith('$2a$')) {
          console.log("Password is using an old format, updating to new format...");
          const newHashedPassword = await bcrypt.hash(trimmedPassword, 10);
          await User.updateOne({ _id: user._id }, { password: newHashedPassword });
          console.log("Password updated to new hash format");
      };

      // Create a JWT token
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

      // Login successful
      return res.json({ token });
  } catch (err) {
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});


  // Logout Route

 router.post('/logout',async (req, res) => {
    res.status(200).json({ message: 'Logout successful. Please remove the token and redirect to the login screen.' });
  });


export default router;