const bcrypt = require('bcrypt');
const authService = require('./auth.service');
const { generateAccessToken, generateRefreshTokenPlain, hashToken, refreshTokenExpiryDate } = require('../utils/tokenUtil');
const pool = require('../config/dbConfig');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = await authService.findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.is_active) return res.status(403).json({ error: 'Account disabled' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    await authService.revokeAllUserRefreshTokens(user.id);

    const payload = {
      sub: user.id,
      email: user.email,
      roleName: user.role_name
    };

    const accessToken = generateAccessToken(payload); 

    const refreshTokenPlain = generateRefreshTokenPlain();
    const saved = await authService.saveRefreshToken(user.id, refreshTokenPlain, req.ip, req.get('User-Agent') || null);

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshTokenPlain, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax', 
      expires: new Date(saved.expires_at)
    });

   return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role_name,
        organizer_status: user.organizer_status || null 
      }
    });


  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const refresh = async (req, res) => {
  try {
    const tokenPlain = req.cookies.refreshToken;
    if (!tokenPlain) return res.status(401).json({ message: 'No refresh token' });

    const tokenHash = hashToken(tokenPlain);

    const q = `
      SELECT rt.id, rt.user_id, rt.expires_at, u.email, u.role_id, r.name AS role_name
      FROM refresh_tokens rt
      JOIN users u ON u.id = rt.user_id
      JOIN roles r ON r.id = u.role_id
      WHERE rt.token_hash = $1 AND rt.revoked = false AND (rt.expires_at IS NULL OR rt.expires_at > now())
      LIMIT 1
    `;
    const found = (await pool.query(q, [tokenHash])).rows[0];
    if (!found) return res.status(401).json({ message: 'Invalid refresh token' });

    await pool.query('UPDATE refresh_tokens SET revoked = true WHERE id = $1', [found.id]);

    const accessToken = generateAccessToken({
      sub: found.user_id,
      email: found.email,
      roleName: found.role_name
    });


    const newRefreshPlain = generateRefreshTokenPlain();
    const newHash = hashToken(newRefreshPlain);
    const expiresAt = refreshTokenExpiryDate();

    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1,$2,$3)',
      [found.user_id, newHash, expiresAt]
    );

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', newRefreshPlain, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      expires: new Date(expiresAt)
    });

    return res.json({ accessToken });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const logout = async (req, res) => {
  try {
    const tokenPlain = req.cookies.refreshToken;
    if (tokenPlain) {
      const tokenHash = hashToken(tokenPlain);
      await pool.query('UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1', [tokenHash]);
    }
    // res.clearCookie('refreshToken'); //заміна на 
    res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production'
    });

    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};



// const register = async (req, res) => {
//   try {
//     const { email, password, name } = req.body;

//     if (!email || !password || !name) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const exists = await authService.findUserByEmail(email);
//     if (exists) {
//       return res.status(409).json({ error: 'Email already in use' });
//     }

//     const passwordHash = await bcrypt.hash(password, 12);

//     const user = await authService.createUser({
//       email,
//       name,
//       passwordHash
//     });

//     await authService.revokeAllUserRefreshTokens(user.id);

//     const payload = {
//       sub: user.id,
//       email: user.email,
//       roleName: 'viewer'
//     };
//     const accessToken = generateAccessToken(payload);

//     const refreshPlain = generateRefreshTokenPlain();
//     const saved = await authService.saveRefreshToken(
//       user.id,
//       refreshPlain,
//       req.ip,
//       req.get('User-Agent') || null
//     );

//     const isProd = process.env.NODE_ENV === 'production';
//     res.cookie('refreshToken', refreshPlain, {
//       httpOnly: true,
//       secure: isProd,
//       sameSite: isProd ? 'none' : 'lax',
//       expires: new Date(saved.expires_at)
//     });

//     return res.status(201).json({
//       accessToken,
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         role: 'viewer'
//       }
//     });

//   } catch (err) {
//     console.error('Register error', err);
//     return res.status(500).json({ error: 'Server error' });
//   }
// };

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const exists = await authService.findUserByEmail(email);
    if (exists) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await authService.createUser({
      email,
      name,
      passwordHash
    });

    return res.status(201).json({
      message: 'Account created'
    });

  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};


module.exports = {
  login,
  refresh,
  logout,
  register
};
