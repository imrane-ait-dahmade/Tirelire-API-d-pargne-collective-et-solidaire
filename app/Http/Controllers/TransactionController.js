import TransactionService from "../../Services/transactionService.js";
import BaseController from "./BaseController.js";

class TransactionController extends BaseController {
  // Créer une contribution
  async createContribution(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { groupId, roundId, amount, paymentMethod, metadata } = req.body;
        
        return await TransactionService.createContribution({
          groupId,
          roundId,
          payerId: req.user._id,
          amount,
          paymentMethod,
          metadata,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        });
      },
      'Contribution créée avec succès'
    );
  }

  // Confirmer une transaction
  async confirmTransaction(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await TransactionService.confirmTransaction(
          req.params.id,
          req.user._id
        );
      },
      'Transaction confirmée avec succès'
    );
  }

  // Marquer une transaction comme échouée
  async failTransaction(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { reason } = req.body;
        return await TransactionService.failTransaction(req.params.id, reason);
      },
      'Transaction marquée comme échouée'
    );
  }

  // Obtenir l'historique des transactions d'un groupe
  async getGroupTransactions(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { page, limit, type, status } = req.query;
        return await TransactionService.getGroupTransactions(
          req.params.groupId,
          { page, limit, type, status }
        );
      },
      'Transactions récupérées avec succès'
    );
  }

  // Obtenir l'historique des transactions de l'utilisateur
  async getUserTransactions(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { page, limit } = req.query;
        return await TransactionService.getUserTransactions(req.user._id, {
          page,
          limit
        });
      },
      'Transactions récupérées avec succès'
    );
  }

  // Créer un litige
  async createDispute(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { reason } = req.body;
        return await TransactionService.createDispute(
          req.params.id,
          req.user._id,
          reason
        );
      },
      'Litige créé avec succès'
    );
  }

  // Résoudre un litige (Admin uniquement)
  async resolveDispute(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { resolution } = req.body;
        return await TransactionService.resolveDispute(
          req.params.id,
          req.user._id,
          resolution
        );
      },
      'Litige résolu avec succès'
    );
  }

  // Obtenir les statistiques de transactions
  async getTransactionStats(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await TransactionService.getTransactionStats(
          req.params.groupId
        );
      },
      'Statistiques récupérées avec succès'
    );
  }
}

export default new TransactionController();


