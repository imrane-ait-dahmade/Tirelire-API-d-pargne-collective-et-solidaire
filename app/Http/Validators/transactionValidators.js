import { body, param } from 'express-validator';

// Validation pour créer une contribution
export const createContributionValidation = [
  body('groupId')
    .notEmpty().withMessage('L\'ID du groupe est requis')
    .isMongoId().withMessage('ID de groupe invalide'),
  
  body('roundId')
    .notEmpty().withMessage('L\'ID du tour est requis')
    .isMongoId().withMessage('ID de tour invalide'),
  
  body('amount')
    .notEmpty().withMessage('Le montant est requis')
    .isFloat({ min: 1 }).withMessage('Le montant doit être supérieur à 0'),
  
  body('paymentMethod')
    .notEmpty().withMessage('La méthode de paiement est requise')
    .isIn(['especes', 'virement', 'mobile_money', 'carte_bancaire'])
    .withMessage('Méthode de paiement invalide')
];

// Validation pour créer un litige
export const createDisputeValidation = [
  param('id').isMongoId().withMessage('ID de transaction invalide'),
  body('reason')
    .notEmpty().withMessage('La raison du litige est requise')
    .isLength({ min: 10 }).withMessage('La raison doit contenir au moins 10 caractères')
    .isLength({ max: 500 }).withMessage('La raison ne peut pas dépasser 500 caractères')
];

// Validation pour résoudre un litige
export const resolveDisputeValidation = [
  param('id').isMongoId().withMessage('ID de transaction invalide'),
  body('resolution')
    .notEmpty().withMessage('La résolution est requise')
    .isLength({ min: 10 }).withMessage('La résolution doit contenir au moins 10 caractères')
];

export default {
  createContributionValidation,
  createDisputeValidation,
  resolveDisputeValidation
};


