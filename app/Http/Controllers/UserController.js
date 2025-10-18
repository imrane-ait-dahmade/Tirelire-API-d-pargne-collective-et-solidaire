import UserService from "../../Services/userService.js";
import BaseController from "./BaseController.js";

class UserController extends BaseController {
  // Obtenir tous les utilisateurs (Admin uniquement)
  async getAllUsers(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { page, limit } = req.query;
        return await UserService.getAllUsers({}, { page, limit });
      },
      'Utilisateurs récupérés avec succès'
    );
  }

  // Obtenir un utilisateur par ID
  async getUserById(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await UserService.getUserById(req.params.id);
      },
      'Utilisateur récupéré avec succès'
    );
  }

  // Mettre à jour le profil
  async updateProfile(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await UserService.updateProfile(req.user._id, req.body);
      },
      'Profil mis à jour avec succès'
    );
  }

  // Obtenir les statistiques de l'utilisateur
  async getUserStats(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await UserService.getUserStats(req.user._id);
      },
      'Statistiques récupérées avec succès'
    );
  }

  // Désactiver un compte (Admin uniquement)
  async deactivateUser(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await UserService.deactivateUser(req.params.id);
      },
      'Utilisateur désactivé avec succès'
    );
  }

  // Réactiver un compte (Admin uniquement)
  async reactivateUser(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await UserService.reactivateUser(req.params.id);
      },
      'Utilisateur réactivé avec succès'
    );
  }
}

export default new UserController();


