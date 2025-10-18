// Middleware de gestion des erreurs globales
export const errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err);

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors
    });
  }

  // Erreur de duplication (index unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `Ce ${field} existe déjà`
    });
  }

  // Erreur de cast (ID invalide)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID invalide'
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expiré'
    });
  }

  // Erreur par défaut
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware pour les routes non trouvées
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée - ${req.originalUrl}`
  });
};

export default { errorHandler, notFound };


