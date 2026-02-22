const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    // console.log("TOKEN OK:", payload);

    req.user = {
      id: payload.sub,
      email: payload.email,
      roleName: payload.roleName
    };

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    return res.status(401).json({ message:'Invalid or expired token' });
  }
}

module.exports = { requireAuth };
