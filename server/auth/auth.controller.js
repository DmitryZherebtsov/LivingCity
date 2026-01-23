const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshTokenPlain } = require('../utils/tokenUtil');
const authService = require('./auth.service');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = await authService.findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.is_active) return res.status(403).json({ error: 'Account disabled' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // access token creat
        const payload = {
        sub: user.id,
        email: user.email,
        role: user.role_id,        
        roleName: user.role_name  
    };
    const accessToken = generateAccessToken(payload);

    // refresh token
    const refreshTokenPlain = generateRefreshTokenPlain();
    const saved = await authService.saveRefreshToken(user.id, refreshTokenPlain, req.ip, req.get('User-Agent') || null);

    // Seting refresh token as httpOnly cookie
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshTokenPlain, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax', 
      expires: new Date(saved.expires_at)
    });

    return res.json({
      accessToken,
      user: { id: user.id, email: user.email, role_id: user.role_id }
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  login
};
