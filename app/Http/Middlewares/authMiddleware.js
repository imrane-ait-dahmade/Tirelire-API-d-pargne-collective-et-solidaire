import jwt from 'jsonwebtoken';
import UserModel from '../../Models/User.js';

// Middleware d'authentification JWT
export const authenticate = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification requis'
      });
    }

    const token = authHeader.split(' ')[1];

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Récupérer l'utilisateur
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé'
      });
    }

    // Attacher l'utilisateur à la requête
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification'
    });
  }
};

// Middleware pour authentification optionnelle
export const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await UserModel.findById(decoded.userId);

    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
    }
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur
  }

  next();
};

export default { authenticate, optionalAuthenticate };


