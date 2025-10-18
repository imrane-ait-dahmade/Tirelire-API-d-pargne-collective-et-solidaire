import NotificationService from "../../Services/NotificationService.js";
import BaseController from "./BaseController.js";

class NotificationController extends BaseController {
  // Obtenir les notifications de l'utilisateur
  async getUserNotifications(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { page, limit, isRead } = req.query;
        return await NotificationService.getUserNotifications(req.user._id, {
          page,
          limit,
          isRead: isRead === 'true' ? true : isRead === 'false' ? false : null
        });
      },
      'Notifications récupérées avec succès'
    );
  }

  // Marquer une notification comme lue
  async markAsRead(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await NotificationService.markAsRead(req.params.id);
      },
      'Notification marquée comme lue'
    );
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await NotificationService.markAllAsRead(req.user._id);
      },
      'Toutes les notifications marquées comme lues'
    );
  }

  // Obtenir le nombre de notifications non lues
  async getUnreadCount(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const count = await NotificationService.getUnreadCount(req.user._id);
        return { count };
      },
      'Nombre de notifications non lues récupéré'
    );
  }

  // Supprimer une notification
  async deleteNotification(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await NotificationService.deleteNotification(
          req.params.id,
          req.user._id
        );
      },
      'Notification supprimée'
    );
  }
}

export default new NotificationController();


