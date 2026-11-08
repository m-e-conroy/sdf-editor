/**
 * Role-Based Access Control (RBAC) Guard
 * Middleware logic for protecting routes by role.
 */

export const RBAC = {
  /**
   * Returns a middleware function that checks if user has one of the required roles
   */
  require(allowedRoles) {
    return (req, res, next) => {
      const userRole = req.user?.role;

      if (!userRole) {
        return res.status(401).json({ status: 'fail', message: 'Authentication Required' });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ status: 'fail', message: 'Insufficient Permissions' });
      }

      next();
    };
  },

  /**
   * Hierarchical check (e.g. 'admin' includes 'editor' permissions)
   */
  hasMinimumLevel(userRole, minimumRole) {
    const levels = { 'guest': 0, 'user': 1, 'editor': 2, 'admin': 3 };
    return levels[userRole] >= levels[minimumRole];
  }
};
