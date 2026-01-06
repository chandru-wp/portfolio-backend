const jwt = require('jsonwebtoken');

// Secret key from environment or use default (change in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-portfolio-2025';
const JWT_EXPIRY = '7d';

/**
 * Generate JWT token for authenticated user
 */
const generateToken = (userId, username, role) => {
  try {
    const token = jwt.sign(
      { userId, username, role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Error verifying token:', error.message);
    return null;
  }
};

/**
 * Middleware to verify JWT in Authorization header
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.user = decoded; // Attach user info to request
  next();
};

/**
 * Optional middleware - checks if user is authenticated, but allows unauthenticated requests
 */
const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
  optionalAuthMiddleware
};
