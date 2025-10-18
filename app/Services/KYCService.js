import UserModel from '../Models/User.js';
import BaseService from './BaseService.js';

class KYCService extends BaseService {
  constructor() {
    super(UserModel);
  }

  // Soumettre les informations KYC
  async submitKYC(userId, kycData) {
    try {
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      if (user.kyc.status === 'verifie') {
        throw new Error('Votre KYC est déjà vérifié');
      }

      // Mettre à jour les informations KYC
      user.kyc.nationalIdNumber = kycData.nationalIdNumber;
      user.kyc.nationalIdImage = kycData.nationalIdImage; // Chemin chiffré
      user.kyc.selfieImage = kycData.selfieImage; // Chemin chiffré
      user.kyc.status = 'en_attente';
      user.kyc.submittedAt = new Date();

      await user.save();

      return {
        message: 'Documents KYC soumis avec succès',
        kyc: user.kyc
      };
    } catch (error) {
      throw new Error(`Erreur lors de la soumission du KYC: ${error.message}`);
    }
  }

  // Vérifier le KYC (par un admin)
  async verifyKYC(userId, adminId, isApproved, rejectionReason = null) {
    try {
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      if (user.kyc.status !== 'en_attente') {
        throw new Error('Le KYC n\'est pas en attente de vérification');
      }

      if (isApproved) {
        user.kyc.status = 'verifie';
        user.kyc.verifiedAt = new Date();
        user.kyc.faceVerification.status = 'verified';
        user.kyc.faceVerification.verifiedAt = new Date();
        user.kyc.faceVerification.verifiedBy = 'manual';
        user.kyc.faceVerification.adminId = adminId;
      } else {
        user.kyc.status = 'rejete';
        user.kyc.rejectionReason = rejectionReason || 'Documents non conformes';
      }

      await user.save();

      return {
        message: isApproved ? 'KYC approuvé avec succès' : 'KYC rejeté',
        kyc: user.kyc
      };
    } catch (error) {
      throw new Error(`Erreur lors de la vérification du KYC: ${error.message}`);
    }
  }

  // Vérification faciale automatique (préparation pour intégration future)
  async performFaceVerification(userId) {
    try {
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // TODO: Intégrer avec face-api.js ou un service de reconnaissance faciale
      // Pour l'instant, on simule une vérification réussie
      
      user.kyc.faceVerification.status = 'verified';
      user.kyc.faceVerification.verifiedAt = new Date();
      user.kyc.faceVerification.verifiedBy = 'automatic';

      await user.save();

      return {
        message: 'Vérification faciale effectuée',
        status: user.kyc.faceVerification.status
      };
    } catch (error) {
      throw new Error(`Erreur lors de la vérification faciale: ${error.message}`);
    }
  }

  // Récupérer tous les KYC en attente (pour les admins)
  async getPendingKYC(options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      
      const users = await UserModel.find({ 'kyc.status': 'en_attente' })
        .select('firstName lastName email kyc')
        .limit(limit)
        .skip((page - 1) * limit)
        .sort('-kyc.submittedAt');
      
      const total = await UserModel.countDocuments({ 'kyc.status': 'en_attente' });
      
      return {
        data: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des KYC: ${error.message}`);
    }
  }

  // Vérifier si un utilisateur peut effectuer des actions sensibles
  async canPerformSensitiveAction(userId) {
    try {
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      return user.canPerformSensitiveActions();
    } catch (error) {
      throw new Error(`Erreur lors de la vérification: ${error.message}`);
    }
  }

  // Obtenir le statut KYC d'un utilisateur
  async getKYCStatus(userId) {
    try {
      const user = await UserModel.findById(userId).select('kyc');
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      return user.kyc;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du statut KYC: ${error.message}`);
    }
  }
}

export default new KYCService();


