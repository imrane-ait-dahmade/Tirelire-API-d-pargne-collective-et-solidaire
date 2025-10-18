import MessageService from "../../Services/MessageService.js";
import BaseController from "./BaseController.js";

class MessageController extends BaseController {
  // Envoyer un message
  async sendMessage(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { group, messageType, content, replyTo } = req.body;
        
        return await MessageService.sendMessage({
          group,
          sender: req.user._id,
          messageType,
          content,
          replyTo
        });
      },
      'Message envoyé avec succès'
    );
  }

  // Obtenir les messages d'un groupe
  async getGroupMessages(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { page, limit, before } = req.query;
        return await MessageService.getGroupMessages(req.params.groupId, {
          page,
          limit,
          before
        });
      },
      'Messages récupérés avec succès'
    );
  }

  // Marquer un message comme lu
  async markAsRead(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await MessageService.markAsRead(req.params.id, req.user._id);
      },
      'Message marqué comme lu'
    );
  }

  // Marquer tous les messages comme lus
  async markAllAsRead(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await MessageService.markAllAsRead(
          req.params.groupId,
          req.user._id
        );
      },
      'Messages marqués comme lus'
    );
  }

  // Ajouter une réaction
  async addReaction(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { emoji } = req.body;
        return await MessageService.addReaction(
          req.params.id,
          req.user._id,
          emoji
        );
      },
      'Réaction ajoutée'
    );
  }

  // Supprimer un message
  async deleteMessage(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await MessageService.deleteMessage(req.params.id, req.user._id);
      },
      'Message supprimé'
    );
  }

  // Obtenir le nombre de messages non lus
  async getUnreadCount(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const count = await MessageService.getUnreadCount(
          req.params.groupId,
          req.user._id
        );
        return { count };
      },
      'Nombre de messages non lus récupéré'
    );
  }

  // Rechercher des messages
  async searchMessages(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { q, page, limit } = req.query;
        return await MessageService.searchMessages(req.params.groupId, q, {
          page,
          limit
        });
      },
      'Résultats de recherche récupérés'
    );
  }
}

export default new MessageController();


