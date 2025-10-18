import NotificationModel from "../Models/Notification.js";
import UserModel from "../Models/User.js";
import BaseService from './BaseService.js';

class NotificationService extends BaseService {
  constructor() {
    super(NotificationModel);
  }

  // Créer une notification
  async createNotification(notificationData) {
    try {
      const {
        recipient,
        type,
        title,
        message,
        relatedGroup,
        relatedRound,
        relatedTransaction,
        relatedTicket,
        data,
        priority = 'medium',
        expiresAt
      } = notificationData;

      const notification = new NotificationModel({
        recipient,
        type,
        title,
        message,
        relatedGroup,
        relatedRound,
        relatedTransaction,
        relatedTicket,
        data,
        priority,
        expiresAt
      });

      await notification.save();

      // Envoyer les notifications selon les préférences de l'utilisateur
      await this.sendNotificationChannels(notification);

      return notification;
    } catch (error) {
      throw new Error(`Erreur lors de la création de la notification: ${error.message}`);
    }
  }

  // Envoyer des notifications via différents canaux
  async sendNotificationChannels(notification) {
    try {
      const user = await UserModel.findById(notification.recipient);

      if (!user) return;

      // Email
      if (user.notifications.email) {
        await this.sendEmailNotification(notification, user);
      }

      // SMS
      if (user.notifications.sms) {
        await this.sendSMSNotification(notification, user);
      }

      // Push
      if (user.notifications.push) {
        await this.sendPushNotification(notification, user);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications:', error);
    }
  }

  // Envoyer une notification par email (simulé)
  async sendEmailNotification(notification, user) {
    try {
      // TODO: Implémenter l'envoi réel d'emails
      notification.channels.email.sent = true;
      notification.channels.email.sentAt = new Date();
      await notification.save();
    } catch (error) {
      notification.channels.email.error = error.message;
      await notification.save();
    }
  }

  // Envoyer une notification par SMS (simulé)
  async sendSMSNotification(notification, user) {
    try {
      // TODO: Implémenter l'envoi réel de SMS
      notification.channels.sms.sent = true;
      notification.channels.sms.sentAt = new Date();
      await notification.save();
    } catch (error) {
      notification.channels.sms.error = error.message;
      await notification.save();
    }
  }

  // Envoyer une notification push (simulé)
  async sendPushNotification(notification, user) {
    try {
      // TODO: Implémenter l'envoi réel de notifications push
      notification.channels.push.sent = true;
      notification.channels.push.sentAt = new Date();
      await notification.save();
    } catch (error) {
      notification.channels.push.error = error.message;
      await notification.save();
    }
  }

  // Obtenir les notifications d'un utilisateur
  async getUserNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 20, isRead = null } = options;

      const filters = { recipient: userId };
      if (isRead !== null) filters.isRead = isRead;

      return await this.findAll(filters, {
        page,
        limit,
        populate: 'relatedGroup relatedRound relatedTransaction relatedTicket',
        sort: '-createdAt'
      });
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des notifications: ${error.message}`);
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId) {
    try {
      const notification = await NotificationModel.findById(notificationId);

      if (!notification) {
        throw new Error('Notification non trouvée');
      }

      notification.markAsRead();
      await notification.save();

      return notification;
    } catch (error) {
      throw new Error(`Erreur lors du marquage: ${error.message}`);
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(userId) {
    try {
      const result = await NotificationModel.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      return { count: result.modifiedCount };
    } catch (error) {
      throw new Error(`Erreur lors du marquage: ${error.message}`);
    }
  }

  // Obtenir le nombre de notifications non lues
  async getUnreadCount(userId) {
    try {
      const count = await NotificationModel.countDocuments({
        recipient: userId,
        isRead: false,
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      });

      return count;
    } catch (error) {
      throw new Error(`Erreur lors du comptage: ${error.message}`);
    }
  }

  // Supprimer une notification
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await NotificationModel.findOne({
        _id: notificationId,
        recipient: userId
      });

      if (!notification) {
        throw new Error('Notification non trouvée');
      }

      await notification.deleteOne();
      return { message: 'Notification supprimée' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  // Créer une notification de rappel de paiement
  async createPaymentReminder(userId, groupId, roundId, amount) {
    return await this.createNotification({
      recipient: userId,
      type: 'payment_reminder',
      title: 'Rappel de paiement',
      message: `N'oubliez pas votre contribution de ${amount} MAD pour ce tour.`,
      relatedGroup: groupId,
      relatedRound: roundId,
      priority: 'high',
      data: { amount }
    });
  }

  // Créer une notification de paiement en retard
  async createLatePaymentNotification(userId, groupId, roundId, amount) {
    return await this.createNotification({
      recipient: userId,
      type: 'payment_late',
      title: 'Paiement en retard',
      message: `Votre contribution de ${amount} MAD est en retard. Veuillez effectuer le paiement dès que possible.`,
      relatedGroup: groupId,
      relatedRound: roundId,
      priority: 'urgent',
      data: { amount }
    });
  }

  // Créer une notification de nouveau tour
  async createRoundStartedNotification(userId, groupId, roundId, beneficiary) {
    return await this.createNotification({
      recipient: userId,
      type: 'round_started',
      title: 'Nouveau tour commencé',
      message: `Un nouveau tour a démarré. Le bénéficiaire est ${beneficiary}.`,
      relatedGroup: groupId,
      relatedRound: roundId,
      priority: 'medium',
      data: { beneficiary }
    });
  }

  // Créer une notification "C'est votre tour"
  async createYourTurnNotification(userId, groupId, roundId, amount) {
    return await this.createNotification({
      recipient: userId,
      type: 'your_turn',
      title: 'C\'est votre tour !',
      message: `Vous êtes le bénéficiaire de ce tour. Vous recevrez ${amount} MAD une fois toutes les contributions collectées.`,
      relatedGroup: groupId,
      relatedRound: roundId,
      priority: 'high',
      data: { amount }
    });
  }
}

export default new NotificationService();


