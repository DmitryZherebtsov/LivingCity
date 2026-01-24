const userService = require('../services/userService');

const list = async (req, res) => {
  try {
    const users = await userService.listUsers();
    return res.json(users);
  } catch (err) {
    console.error('List users error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { list };
