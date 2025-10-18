import GroupService from "../../Services/groupeService.js";
import BaseController from "./BaseController.js";

class GroupController extends BaseController {
  // Créer un nouveau groupe
  async createGroup(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await GroupService.createGroup(req.user._id, req.body);
      },
      'Groupe créé avec succès'
    );
  }

  // Obtenir tous les groupes de l'utilisateur
  async getUserGroups(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { status } = req.query;
        return await GroupService.getUserGroups(req.user._id, status);
      },
      'Groupes récupérés avec succès'
    );
  }

  // Obtenir les détails d'un groupe
  async getGroupDetails(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await GroupService.getGroupDetails(req.params.id, req.user._id);
      },
      'Détails du groupe récupérés avec succès'
    );
  }

  // Ajouter un membre au groupe
  async addMember(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { userId } = req.body;
        return await GroupService.addMember(
          req.params.id,
          userId,
          req.user._id
        );
      },
      'Membre ajouté avec succès'
    );
  }

  // Retirer un membre du groupe
  async removeMember(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { userId } = req.body;
        return await GroupService.removeMember(
          req.params.id,
          userId,
          req.user._id
        );
      },
      'Membre retiré avec succès'
    );
  }

  // Démarrer le groupe
  async startGroup(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await GroupService.startGroup(req.params.id, req.user._id);
      },
      'Groupe démarré avec succès'
    );
  }

  // Mettre à jour les paramètres du groupe
  async updateGroupSettings(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await GroupService.updateGroupSettings(
          req.params.id,
          req.user._id,
          req.body
        );
      },
      'Paramètres mis à jour avec succès'
    );
  }

  // Terminer le groupe
  async endGroup(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await GroupService.endGroup(req.params.id, req.user._id);
      },
      'Groupe terminé avec succès'
    );
  }
}

export default new GroupController();


