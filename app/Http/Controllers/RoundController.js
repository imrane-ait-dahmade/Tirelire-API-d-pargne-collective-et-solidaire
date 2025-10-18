import RoundService from "../../Services/RoundService.js";
import BaseController from "./BaseController.js";

class RoundController extends BaseController {
  // Obtenir les tours d'un groupe
  async getGroupRounds(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { page, limit } = req.query;
        return await RoundService.getGroupRounds(req.params.groupId, {
          page,
          limit
        });
      },
      'Tours récupérés avec succès'
    );
  }

  // Obtenir le tour actuel
  async getCurrentRound(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await RoundService.getCurrentRound(req.params.groupId);
      },
      'Tour actuel récupéré avec succès'
    );
  }

  // Obtenir les statistiques d'un tour
  async getRoundStats(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await RoundService.getRoundStats(req.params.id);
      },
      'Statistiques du tour récupérées avec succès'
    );
  }

  // Obtenir les participants en retard
  async getLateParticipants(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await RoundService.getLateParticipants(req.params.id);
      },
      'Participants en retard récupérés avec succès'
    );
  }

  // Compléter un tour et créer le suivant
  async completeRound(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await RoundService.completeRoundAndCreateNext(req.params.id);
      },
      'Tour complété avec succès'
    );
  }
}

export default new RoundController();


