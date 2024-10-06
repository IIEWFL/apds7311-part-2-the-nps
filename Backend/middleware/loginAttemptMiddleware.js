import LoginAttempt from '../models/LoginAttempts.js';

const loginAttemptLogger = async(req, res, next) => {
    const originalJson = res.json;  // Store original res.json method

    // Override res.json method
    res.json = function (data) {
    console.log('Login attempt:', req.body);  // Log the login attempt

    // Log response data (e.g., token or error message)
    console.log('Login response data:', data);

    // Call the original res.json method with the provided data
    originalJson.call(this, data);
    };

    next();
}
export default loginAttemptLogger;