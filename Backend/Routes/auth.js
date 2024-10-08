import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Staff from '../models/Staff.js';
import bruteForce from '../middleware/bruteForceProtectionMiddleware.js';
import loginAttemptLogger from '../middleware/loginAttemptMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;


// Registration Route
router.post('/register', async (req, res) => {
    console.log('Register route hit');
    try {
        const { username, fullName, idNumber, accountNumber, password } = req.body;

        // Define regex patterns
        const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
        const fullNameRegex = /^[a-zA-Z\s]+$/;
        const idNumberRegex = /^[0-9]{13}$/;
        const accountNumberRegex = /^[0-9]{10,12}$/;
     
        // Validate the inputs with regex
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ message: 'Invalid username. Must be 3-30 characters, alphanumeric, and can include underscores.' });
        }
        if (!fullNameRegex.test(fullName)) {
            return res.status(400).json({ message: 'Invalid full name. Only letters and spaces are allowed.' });
        }
        if (!idNumberRegex.test(idNumber)) {
            return res.status(400).json({ message: 'Invalid ID number. Must be a 13-digit number.' });
        }
        if (!accountNumberRegex.test(accountNumber)) {
            return res.status(400).json({ message: 'Invalid account number. Must be 10-12 digits.' });
        }
    

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

// Registration Route 
router.post('/register/staff', async (req, res) => {
    console.log('Register route hit');
    try {
        const { username, fullName, password } = req.body;

        // Define regex patterns
        const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
        const fullNameRegex = /^[a-zA-Z\s]+$/;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

        // Validate inputs with regex
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ message: 'Invalid username. Must be 3-30 characters, alphanumeric, and can include underscores.' });
        }
        if (!fullNameRegex.test(fullName)) {
            return res.status(400).json({ message: 'Invalid full name. Only letters and spaces are allowed.' });
        }
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Invalid password. Must be at least 8 characters long, include at least one letter and one number.' });
        }

        // Check if staff member already exists by username
        const existingStaff = await Staff.findOne({ username });
        if (existingStaff) {
            return res.status(400).json({ message: 'Staff member with this username already exists' });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new staff
        const staff = new Staff({
            username,
            fullName,
            password: hashedPassword
        });
        await staff.save();

        res.status(201).json({ message: 'Staff member registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Login Route
router.post('/login/user', bruteForce.prevent, loginAttemptLogger, async (req, res) => {
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

// Login Route
router.post('/login/staff', bruteForce.prevent, loginAttemptLogger, async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log('Login attempt:', req.body); // Log the incoming request body

        // Find the user by username
        const existingStaff = await Staff.findOne({ username });

        if (!existingStaff) {
            console.log('User not found');
            return res.status(404).json({ message: 'User Account Not Found' });
        }

        console.log('User found:', existingStaff); // Log the user retrieved from the database

        // Compare provided password with stored hashed password
        const isMatch = await bcrypt.compare(password, existingStaff.password);

        console.log('Password comparison:', { providedPassword: password, storedPasswordHash: existingStaff.password });

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }


        // Create a JWT token
        const token = jwt.sign({ id: existingStaff._id }, JWT_SECRET, { expiresIn: '1h' });

        // Login successful
        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Logout Route
router.post('/logout', async (req, res) => {
    res.status(200).json({ message: 'Logout successful. Please remove the token and redirect to the login screen.' });
});

export default router;

// This method was adapted from various discussions and tutorials on setting up authentication routes with Express
// https://dev.to/aritik/setting-up-auth-routes-with-express-57oi
// DEV Community
// https://dev.to