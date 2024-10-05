import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bruteForce from '../middleware/bruteForceProtectionMiddleware.js';
import loginAttemptLogger from '../middleware/loginAttemptMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Registration Route
router.post('/register', async (req, res) => {
    console.log('Register route hit');
    try {
        const { username, fullName, idNumber, accountNumber, password } = req.body;
    
        // Check if user already exists by account number
        const existingUser = await User.findOne({ accountNumber });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this account number already exists' });
        }
        
        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            username,
            fullName,
            idNumber,
            accountNumber,
            password: hashedPassword
        });
        await user.save();
    
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Login Route
router.post('/login', bruteForce.prevent, loginAttemptLogger, async (req, res) => {
    try {
        const { username, accountNumber, password } = req.body;

        console.log('Login attempt:', req.body); // Log the incoming request body

        // Find the user by account number
        const user = await User.findOne({ accountNumber });
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User Account Not Found' });
        }

        console.log('User found:', user); // Log the user retrieved from the database

        // Ensure the username matches
        if (user.username !== username) {
            return res.status(400).json({ message: 'Invalid Username or Account Number' });
        }

        // Compare provided password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

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
});

// Logout Route
router.post('/logout', async (req, res) => {
    res.status(200).json({ message: 'Logout successful. Please remove the token and redirect to the login screen.' });
});

export default router;
