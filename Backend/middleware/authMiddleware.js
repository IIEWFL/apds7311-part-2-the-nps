import jwt from 'jsonwebtoken';

const { TokenExpiredError, JsonWebTokenError } = jwt;

const authMiddleware = (req, res, next) => {
    console.log('Request Headers:', req.headers);

    const authHeader = req.header('Authorization');
    console.log('Authorization Header:', authHeader);

    if (!authHeader) {
        return res.status(401).json({ message: 'No authorization header, access denied' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        return res.status(401).json({ message: 'Authorization header format must be Bearer [Token]' });
    }

    const token = parts[1];
    console.log('Token:', token);
    if (!token) {
        return res.status(401).json({ message: 'No token provided, access denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded', decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification failed:', err);
        if (err instanceof JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token, access denied' });
        } else if (err instanceof TokenExpiredError) {
            return res.status(401).json({ message: 'Token expired, access denied' });
        }
        return res.status(401).json({ message: 'Server error during authentication', error: err });
    }
};

export default authMiddleware;
