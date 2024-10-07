import jwt from 'jsonwebtoken'; // Import the jsonwebtoken library for handling token creation and verification

// Destructure potential error types from the jwt package
const { TokenExpiredError, JsonWebTokenError } = jwt;

const authMiddleware = (req, res, next) => {
    // Log request headers for debugging purposes
    console.log('Request Headers:', req.headers);

    // Extract the Authorization header from the request
    const authHeader = req.header('Authorization');
    console.log('Authorization Header:', authHeader);

    // If no Authorization header is present, reject the request with a 401 status
    if (!authHeader) {
        console.warn('No authorization header, access denied'); // Log a warning for missing header
        return res.status(401).json({ message: 'No authorization header, access denied' });
    }

    // Split the Authorization header into two parts (format: "Bearer [Token]")
    const parts = authHeader.split(' ');
    
    // If the Authorization header doesn't consist of two parts, reject with a 401 error
    if (parts.length !== 2) {
        console.warn('Authorization header format must be Bearer [Token], access denied'); // Log a warning
        return res.status(401).json({ message: 'Authorization header format must be Bearer [Token]' });
    }

    // Extract the token part from the Authorization header
    const token = parts[1];
    console.log('Token:', token);

    // If no token is provided after "Bearer", reject the request with a 401 status
    if (!token) {
        console.warn('No token provided, access denied'); // Log a warning
        return res.status(401).json({ message: 'No token provided, access denied' });
    }

    try {
        // Verify the JWT token using the secret stored in environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded); // Log the decoded token

        // Attach the decoded token payload (user information) to the request object
        req.user = decoded;

        // Pass control to the next middleware or route handler
        console.info('Token successfully verified, proceeding to next middleware'); // Log success
        next();
    } catch (err) {
        // If the token verification fails, log the error and handle different error types
        console.error('Token verification failed:', err); // Log error details

        // Handle invalid token errors
        if (err instanceof JsonWebTokenError) {
            console.warn('Invalid token, access denied'); // Log a warning
            return res.status(401).json({ message: 'Invalid token, access denied' });
        } 
        // Handle token expiration errors
        else if (err instanceof TokenExpiredError) {
            console.warn('Token expired, access denied'); // Log a warning
            return res.status(401).json({ message: 'Token expired, access denied' });
        }

        // Handle any other potential errors during authentication
        console.error('Server error during authentication:', err); // Log the server error
        return res.status(401).json({ message: 'Server error during authentication', error: err });
    }
};

export default authMiddleware; // Export the middleware for use in other parts of the application

// This method was adapted from the jsonwebtoken library documentation on handling token creation and verification
// https://github.com/auth0/node-jsonwebtoken
// Auth0 Community
// https://github.com/auth0