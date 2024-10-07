import LoginAttempt from '../models/LoginAttempts.js'; // Import the LoginAttempt model for logging login attempts

// Middleware to log login attempts
const loginAttemptLogger = async (req, res, next) => {
    // Store the original res.json method to call it later
    const originalJson = res.json.bind(res); // Bind the context to res to ensure correct reference

    // Overwrite the res.json method to include logging functionality
    res.json = function(data) {
        // Extract the username from the request body
        const username = req.body.username;

        // Get the client's IP address
        // It assumes req.id is set elsewhere in the application; otherwise, it falls back to req.connection.remoteAddress
        const ipAddress = req.id || req.connection.remoteAddress;

        // Determine if the login attempt was successful
        // A successful login is indicated by the absence of an error message or the message not being 'Invalid Credentials'
        const successfulLogin = !data.message || data.message !== 'Invalid Credentials';

        // Create a new login attempt log in the database
        LoginAttempt.create({
            username,       // The username attempted
            ipAddress,      // The IP address of the user
            successfulLogin // Boolean indicating if the attempt was successful
        })
        .catch(err => console.error('Error logging login attempt:', err)); // Log any error that occurs during the logging process

        // Call the original res.json method with the appropriate context and data
        return originalJson(data); // Ensure that the response is sent back as intended
    };

    next(); // Proceed to the next middleware or route handler in the stack
};

// Export the middleware function for use in other parts of the application
export default loginAttemptLogger;

// This method was adapted from the OWASP Logging Cheat Sheet and various discussions on logging login attempts
// https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html