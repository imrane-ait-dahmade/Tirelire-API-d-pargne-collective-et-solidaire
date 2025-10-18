import { body, param } from 'express-validator';

// Validation pour la création de groupe
export const createGroupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom du groupe est requis')
    .isLength({ min: 3 }).withMessage('Le nom doit contenir au moins 3 caractères')
    .isLength({ max: 100 }).withMessage('Le nom ne peut pas dépasser 100 caractères'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La description ne peut pas dépasser 500 caractères'),
  
  body('contributionSettings.amount')
    .notEmpty().withMessage('Le montant de contribution est requis')
    .isFloat({ min: 1 }).withMessage('Le montant doit être supérieur à 0'),
  
  body('contributionSettings.frequency')
    .notEmpty().withMessage('La fréquence est requise')
    .isIn(['hebdomadaire', 'bimensuel', 'mensuel']).withMessage('Fréquence invalide'),
  
  body('contributionSettings.paymentDeadline')
    .notEmpty().withMessage('La date limite de paiement est requise')
    .isInt({ min: 1, max: 31 }).withMessage('Date limite invalide'),
  
  body('rules.minReliabilityScore')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Score de fiabilité invalide'),
  
  body('rules.maxMembers')
    .optional()
    .isInt({ min: 2, max: 50 }).withMessage('Nombre maximum de membres invalide')
];

// Validation pour l'ajout de membre
export const addMemberValidation = [
  param('id').isMongoId().withMessage('ID de groupe invalide'),
  body('userId').isMongoId().withMessage('ID d\'utilisateur invalide')
];

// Validation pour la mise à jour des paramètres
export const updateGroupValidation = [
  param('id').isMongoId().withMessage('ID de groupe invalide'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La description ne peut pas dépasser 500 caractères'),
  
  body('rules.minReliabilityScore')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Score de fiabilité invalide')
];

export default {
  createGroupValidation,
  addMemberValidation,
  updateGroupValidation
};


