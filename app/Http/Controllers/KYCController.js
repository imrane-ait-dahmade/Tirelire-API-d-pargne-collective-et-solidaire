import KYCService from "../../Services/KYCService.js";
import BaseController from "./BaseController.js";

class KYCController extends BaseController {
  // Soumettre les informations KYC
  async submitKYC(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { nationalIdNumber } = req.body;
        
        const nationalIdImage = req.files?.nationalIdImage?.[0]?.path;
        const selfieImage = req.files?.selfieImage?.[0]?.path;

        return await KYCService.submitKYC(req.user._id, {
          nationalIdNumber,
          nationalIdImage,
          selfieImage
        });
      },
      'KYC soumis avec succès'
    );
  }

  // Obtenir le statut KYC
  async getKYCStatus(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await KYCService.getKYCStatus(req.user._id);
      },
      'Statut KYC récupéré avec succès'
    );
  }

  // Vérifier le KYC (Admin uniquement)
  async verifyKYC(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { userId } = req.params;
        const { isApproved, rejectionReason } = req.body;
        
        return await KYCService.verifyKYC(
          userId,
          req.user._id,
          isApproved,
          rejectionReason
        );
      },
      'KYC vérifié avec succès'
    );
  }

  // Obtenir tous les KYC en attente (Admin uniquement)
  async getPendingKYC(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { page, limit } = req.query;
        return await KYCService.getPendingKYC({ page, limit });
      },
      'KYC en attente récupérés avec succès'
    );
  }

  // Effectuer la vérification faciale
  async performFaceVerification(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await KYCService.performFaceVerification(req.user._id);
      },
      'Vérification faciale effectuée avec succès'
    );
  }
}

export default new KYCController();


