import rateLimit from 'express-rate-limit';

// Rate limiter général
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requêtes par fenêtre
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour l'authentification
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 tentatives de connexion
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.'
  },
  skipSuccessfulRequests: true,
});

// Rate limiter pour la création de ressources
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // max 10 créations par heure
  message: {
    success: false,
    message: 'Limite de création atteinte, veuillez réessayer dans une heure.'
  },
});

export default {
  generalLimiter,
  authLimiter,
  createLimiter
};


