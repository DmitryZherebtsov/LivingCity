function requireRole(allowed = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userRole =
      req.user.roleName ||
      req.user.role ||
      req.user.role_id ||
      null;

    if (!userRole) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const normalizedUserRole = String(userRole).toLowerCase();

    const ok = allowed.some(a =>
      String(a).toLowerCase() === normalizedUserRole
    );

    if (!ok) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
}

module.exports = { requireRole };
