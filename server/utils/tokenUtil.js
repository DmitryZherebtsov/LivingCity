const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES_DAYS } = require('../config/jwtConfig');

function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
}

function generateRefreshTokenPlain() {
  return crypto.randomBytes(64).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function refreshTokenExpiryDate() {
  const days = REFRESH_TOKEN_EXPIRES_DAYS;
  const exp = new Date(Date.now() + days * 24 * 60 * 60 * 1000); 
  return exp;
}

module.exports = {
  generateAccessToken,
  generateRefreshTokenPlain,
  hashToken,
  refreshTokenExpiryDate
};
