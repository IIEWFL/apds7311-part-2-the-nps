import LoginAttempt from '../models/LoginAttempts.js';

const loginAttemptLogger = async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function(data) {
        const username = req.body.username;
        const ipAddress = req.id || req.connection.remoteAddress; // Assuming req.id is set elsewhere
        const successfulLogin = !data.message || data.message !== 'Invalid Credentials';

        // Create a new login attempt log
        LoginAttempt.create({ username, ipAddress, successfulLogin })
            .catch(err => console.error('Error logging Login attempt:', err)); // Handle logging error
        try {
            LoginAttempt.create({ username, ipAddress, successfulLogin });
        } catch (err) {
            console.error('Error logging login attempt:', err);
            // Optionally, you could use a proper logging system here
        }
        // Call the original res.json with the correct context and data
        return originalJson(data); // Call the original json method
    };

    next();  // Call next middleware or route handler
};

export default loginAttemptLogger;
