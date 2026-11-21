const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return process.env.JWT_SECRET;
};

const generateToken = (admin) =>
  jwt.sign(
    {
      sub: admin._id.toString(),
      role: admin.role,
    },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    },
  );

const verifyToken = (token) => jwt.verify(token, getJwtSecret());

module.exports = { generateToken, verifyToken };