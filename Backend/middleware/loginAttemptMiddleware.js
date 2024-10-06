import LoginAttempt from '../models/LoginAttempts.js';

const loginAttemptLogger = async (req, res, next) => {
    // Store the original res.json method and bind it to res
    const originalJson = res.json.bind(res);

    // Overwrite res.json
    res.json = function(data) {
        // Log the login attempt
        console.log('Login attempt:', req.body);

        // Log response data
        console.log('Login response data:', data);

        // Gather additional information for logging
        const accountNumber = req.body.accountNumber;
        const ipAddress = req.id || req.connection.remoteAddress; // Assuming req.id is set elsewhere
        const successfulLogin = !data.message || data.message !== 'Invalid Credentials';

        // Create a new login attempt log
        LoginAttempt.create({ accountNumber, ipAddress, successfulLogin })
            .catch(err => console.error('Error logging Login attempt:', err)); // Handle logging error

        // Call the original res.json method with the provided data
        return originalJson(data); // Call the original json method
    };

    next(); // Call next middleware or route handler
};

export default loginAttemptLogger;