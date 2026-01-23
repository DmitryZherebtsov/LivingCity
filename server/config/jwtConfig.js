require('dotenv').config();

module.exports = {
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES || '15m', 
  REFRESH_TOKEN_EXPIRES_DAYS: parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10)
};
