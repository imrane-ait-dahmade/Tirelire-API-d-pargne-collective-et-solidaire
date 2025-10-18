import MessageModel from "../Models/Message.js";
import GroupModel from "../Models/Group.js";
import BaseService from './BaseService.js';

class MessageService extends BaseService {
  constructor() {
    super(MessageModel);
  }

  // Envoyer un message dans un groupe
  async sendMessage(messageData) {
    try {
      const { group, sender, messageType, content } = messageData;

      // Vérifier que le groupe existe et que l'utilisateur en est membre
      const groupDoc = await GroupModel.findById(group);

      if (!groupDoc) {
        throw new Error('Groupe non trouvé');
      }

      if (!groupDoc.isMember(sender)) {
        throw new Error('Vous devez être membre du groupe pour envoyer des messages');
      }

      // Vérifier que le type de message est autorisé
      if (messageType === 'audio' && !groupDoc.allowAudioMessages) {
        throw new Error('Les messages audio ne sont pas autorisés dans ce groupe');
      }

      if (!groupDoc.allowMessages) {
        throw new Error('Les messages ne sont pas autorisés dans ce groupe');
      }

      const message = new MessageModel({
        group,
        sender,
        messageType,
        content,
        isSystemMessage: false
      });

      await message.save();
      return message.populate('sender', 'firstName lastName');
    } catch (error) {
      throw new Error(`Erreur lors de l'envoi du message: ${error.message}`);
    }
  }

  // Envoyer un message système
  async sendSystemMessage(groupId, systemMessageType, messageText) {
    try {
      const message = new MessageModel({
        group: groupId,
        sender: null,
        messageType: 'system',
        content: { text: messageText },
        isSystemMessage: true,
        systemMessageType
      });

      await message.save();
      return message;
    } catch (error) {
      throw new Error(`Erreur lors de l'envoi du message système: ${error.message}`);
    }
  }

  // Obtenir les messages d'un groupe
  async getGroupMessages(groupId, options = {}) {
    try {
      const { page = 1, limit = 50, before = null } = options;

      const filters = { 
        group: groupId,
        isDeleted: false
      };

      if (before) {
        filters.createdAt = { $lt: new Date(before) };
      }

      const messages = await MessageModel.find(filters)
        .populate('sender', 'firstName lastName')
        .populate('replyTo', 'content.text sender')
        .sort('-createdAt')
        .limit(limit)
        .skip((page - 1) * limit);

      const total = await MessageModel.countDocuments(filters);

      return {
        data: messages.reverse(), // Inverser pour avoir les plus anciens en premier
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des messages: ${error.message}`);
    }
  }

  // Marquer un message comme lu
  async markAsRead(messageId, userId) {
    try {
      const message = await MessageModel.findById(messageId);

      if (!message) {
        throw new Error('Message non trouvé');
      }

      message.markAsRead(userId);
      await message.save();

      return message;
    } catch (error) {
      throw new Error(`Erreur lors du marquage en lecture: ${error.message}`);
    }
  }

  // Marquer tous les messages d'un groupe comme lus
  async markAllAsRead(groupId, userId) {
    try {
      const messages = await MessageModel.find({
        group: groupId,
        'readBy.userId': { $ne: userId },
        isDeleted: false
      });

      for (const message of messages) {
        message.markAsRead(userId);
        await message.save();
      }

      return { count: messages.length };
    } catch (error) {
      throw new Error(`Erreur lors du marquage en lecture: ${error.message}`);
    }
  }

  // Ajouter une réaction à un message
  async addReaction(messageId, userId, emoji) {
    try {
      const message = await MessageModel.findById(messageId);

      if (!message) {
        throw new Error('Message non trouvé');
      }

      message.addReaction(userId, emoji);
      await message.save();

      return message;
    } catch (error) {
      throw new Error(`Erreur lors de l'ajout de la réaction: ${error.message}`);
    }
  }

  // Supprimer un message (soft delete)
  async deleteMessage(messageId, userId) {
    try {
      const message = await MessageModel.findById(messageId);

      if (!message) {
        throw new Error('Message non trouvé');
      }

      // Vérifier que l'utilisateur est l'auteur ou un admin
      if (message.sender.toString() !== userId.toString()) {
        const group = await GroupModel.findById(message.group);
        if (!group.isAdmin(userId)) {
          throw new Error('Non autorisé');
        }
      }

      message.softDelete(userId);
      await message.save();

      return message;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  // Obtenir le nombre de messages non lus
  async getUnreadCount(groupId, userId) {
    try {
      const count = await MessageModel.countDocuments({
        group: groupId,
        'readBy.userId': { $ne: userId },
        sender: { $ne: userId }, // Ne pas compter ses propres messages
        isDeleted: false
      });

      return count;
    } catch (error) {
      throw new Error(`Erreur lors du comptage des messages non lus: ${error.message}`);
    }
  }

  // Rechercher des messages dans un groupe
  async searchMessages(groupId, searchTerm, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;

      const messages = await MessageModel.find({
        group: groupId,
        'content.text': { $regex: searchTerm, $options: 'i' },
        isDeleted: false
      })
        .populate('sender', 'firstName lastName')
        .sort('-createdAt')
        .limit(limit)
        .skip((page - 1) * limit);

      const total = await MessageModel.countDocuments({
        group: groupId,
        'content.text': { $regex: searchTerm, $options: 'i' },
        isDeleted: false
      });

      return {
        data: messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la recherche: ${error.message}`);
    }
  }
}

export default new MessageService();


