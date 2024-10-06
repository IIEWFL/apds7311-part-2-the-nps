import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Ensure this is called to load environment variables

const { TokenExpiredError, JsonWebTokenError } = jwt;

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization']; // Changed to lowercase for consistency

    // Log the authorization header for debugging
    console.log('Authorization Header:', authHeader);

    if (!authHeader) {
        return res.status(401).json({ message: 'No authorization header provided, access denied.' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Authorization header format must be Bearer [Token]' });
    }

    const token = parts[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided, access denied.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded user info to request
        next();
    } catch (err) {
        console.error('Token verification failed:', err);
        if (err instanceof TokenExpiredError) {
            return res.status(401).json({ message: 'Token has expired, please log in again.' });
        } else if (err instanceof JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token, access denied.' });
        }
        return res.status(500).json({ message: 'Server error during authentication.', error: err.message });
    }
};


export default authMiddleware;