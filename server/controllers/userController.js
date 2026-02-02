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

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, roleId, isActive } = req.body;

    const updated = await userService.updateUser(id, {
      email,
      name,
      roleId,
      isActive
    });

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(updated);
  } catch (err) {
    console.error('Update user error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await userService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("Delete user error", err);
    return res.status(500).json({ message: "Server error" });
  }
};


module.exports = { 
  list,
  update,
  remove,
};
