import LoginAttempt from '../models/LoginAttempts.js'; // Import the LoginAttempt model for logging login attempts

// Middleware to log login attempts
const loginAttemptLogger = async (req, res, next) => {
    // Store the original res.json method to call it later
    const originalJson = res.json.bind(res); // Bind the context to res to ensure correct reference

    // Overwrite the res.json method to include logging functionality
    res.json = async function(data) {
        // Extract the username from the request body
        const username = req.body.username;

        // Get the client's IP address
        const ipAddress = req.ip || req.connection.remoteAddress; // Use req.ip for better accuracy

        // Determine if the login attempt was successful
        const successfulLogin = res.statusCode === 200; // Success if status code is 200

        // Log the login attempt details before trying to save to the database
        console.log('Attempting to log login attempt:', { username, ipAddress, successfulLogin });

        // Create a new login attempt log in the database
        try {
            const loginAttempt = await LoginAttempt.create({
                username,
                ipAddress,
                successfulLogin
            });
            console.log('Login attempt logged successfully:', loginAttempt); // Log the successful addition of the attempt
        } catch (err) {
            console.error('Error logging login attempt:', err); // Log any error that occurs during the logging process
        }

        // Call the original res.json method with the appropriate context and data
        return originalJson(data); // Ensure that the response is sent back as intended
    };

    next(); // Proceed to the next middleware or route handler in the stack
};

// Export the middleware function for use in other parts of the application
export default loginAttemptLogger;


// This method was adapted from the OWASP Logging Cheat Sheet and various discussions on logging login attempts
// https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html