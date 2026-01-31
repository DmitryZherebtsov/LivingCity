function requireRole(allowed = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const userRoleId = req.user.roleId;
    const userRoleName = req.user.roleName && String(req.user.roleName).toLowerCase();

    const ok = allowed.some(a => {
      const allowedVal = String(a).toLowerCase();
      if (allowedVal === userRoleName) return true;
      if (userRoleId && String(a) === String(userRoleId)) return true;
      return false;
    });

    if (!ok) return res.status(403).json({ message: 'Forbidden' });
    return next();
  };
}

module.exports = { requireRole };
