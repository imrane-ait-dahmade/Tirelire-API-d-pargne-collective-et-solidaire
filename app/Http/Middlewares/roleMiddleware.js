// Middleware pour vérifier les rôles
export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Rôle insuffisant.'
      });
    }

    next();
  };
};

// Middleware pour vérifier que l'utilisateur est admin
export const isAdmin = (req, res, next) => {
  return checkRole('Admin')(req, res, next);
};

// Middleware pour vérifier que l'utilisateur est un particulier
export const isParticulier = (req, res, next) => {
  return checkRole('Particulier')(req, res, next);
};

// Middleware pour vérifier que l'utilisateur a un KYC vérifié
export const requireKYC = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  if (!req.user.canPerformSensitiveActions()) {
    return res.status(403).json({
      success: false,
      message: 'Vérification KYC requise pour cette action'
    });
  }

  next();
};

export default { checkRole, isAdmin, isParticulier, requireKYC };


