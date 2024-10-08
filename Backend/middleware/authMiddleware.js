import { verify, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

const BEARER_PREFIX = 'Bearer ';

class InvalidTokenFormatError extends Error {
  constructor() {
    super('Authorization header format must be Bearer [Token]');
    this.name = 'InvalidTokenFormatError';
  }
}

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header, access denied' });
  }

  if (!authHeader.startsWith(BEARER_PREFIX)) {
    return res.status(401).json({ message: 'Authorization header format must be Bearer [Token]' });
  }

  const token = authHeader.slice(BEARER_PREFIX.length);

  if (!token) {
    return res.status(401).json({ message: 'No token provided, access denied' });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);

    if (err instanceof TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired, access denied' });
    }

    if (err instanceof JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token, access denied' });
    }

    return res.status(500).json({ message: 'Server error during authentication' });
  }
};

export default authMiddleware;
