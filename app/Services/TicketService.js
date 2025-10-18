import TicketModel from "../Models/Ticket.js";
import GroupModel from "../Models/Group.js";
import BaseService from './BaseService.js';

class TicketService extends BaseService {
  constructor() {
    super(TicketModel);
  }

  // Créer un nouveau ticket
  async createTicket(ticketData) {
    try {
      const { createdBy, group, title, description, category, relatedTransaction } = ticketData;

      // Vérifier que le groupe existe et que l'utilisateur en est membre
      const groupDoc = await GroupModel.findById(group);
      
      if (!groupDoc) {
        throw new Error('Groupe non trouvé');
      }

      if (!groupDoc.isMember(createdBy)) {
        throw new Error('Vous devez être membre du groupe');
      }

      const ticket = new TicketModel({
        createdBy,
        group,
        title,
        description,
        category,
        relatedTransaction,
        status: 'ouvert',
        priority: 'moyenne'
      });

      await ticket.save();
      return ticket;
    } catch (error) {
      throw new Error(`Erreur lors de la création du ticket: ${error.message}`);
    }
  }

  // Obtenir tous les tickets d'un groupe
  async getGroupTickets(groupId, options = {}) {
    try {
      const { page = 1, limit = 10, status = null } = options;

      const filters = { group: groupId };
      if (status) filters.status = status;

      return await this.findAll(filters, {
        page,
        limit,
        populate: 'createdBy assignedTo',
        sort: '-createdAt'
      });
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des tickets: ${error.message}`);
    }
  }

  // Obtenir les tickets créés par un utilisateur
  async getUserTickets(userId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;

      return await this.findAll({ createdBy: userId }, {
        page,
        limit,
        populate: 'group assignedTo',
        sort: '-createdAt'
      });
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des tickets: ${error.message}`);
    }
  }

  // Obtenir les tickets assignés à un admin
  async getAssignedTickets(adminId, options = {}) {
    try {
      const { page = 1, limit = 10, status = null } = options;

      const filters = { assignedTo: adminId };
      if (status) filters.status = status;

      return await this.findAll(filters, {
        page,
        limit,
        populate: 'createdBy group',
        sort: '-createdAt'
      });
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des tickets: ${error.message}`);
    }
  }

  // Assigner un ticket à un admin
  async assignTicket(ticketId, adminId) {
    try {
      const ticket = await TicketModel.findById(ticketId);

      if (!ticket) {
        throw new Error('Ticket non trouvé');
      }

      ticket.assignedTo = adminId;
      ticket.assignedAt = new Date();
      
      if (ticket.status === 'ouvert') {
        ticket.status = 'en_cours';
      }

      await ticket.save();
      return ticket;
    } catch (error) {
      throw new Error(`Erreur lors de l'assignation: ${error.message}`);
    }
  }

  // Ajouter une réponse à un ticket
  async addResponse(ticketId, userId, message, isAdmin = false) {
    try {
      const ticket = await TicketModel.findById(ticketId);

      if (!ticket) {
        throw new Error('Ticket non trouvé');
      }

      ticket.addResponse(userId, message, isAdmin);
      await ticket.save();

      return ticket;
    } catch (error) {
      throw new Error(`Erreur lors de l'ajout de la réponse: ${error.message}`);
    }
  }

  // Résoudre un ticket
  async resolveTicket(ticketId, userId, resolutionNote) {
    try {
      const ticket = await TicketModel.findById(ticketId);

      if (!ticket) {
        throw new Error('Ticket non trouvé');
      }

      ticket.resolve(userId, resolutionNote);
      await ticket.save();

      return ticket;
    } catch (error) {
      throw new Error(`Erreur lors de la résolution: ${error.message}`);
    }
  }

  // Fermer un ticket
  async closeTicket(ticketId, userId) {
    try {
      const ticket = await TicketModel.findById(ticketId);

      if (!ticket) {
        throw new Error('Ticket non trouvé');
      }

      ticket.status = 'ferme';
      ticket.closedAt = new Date();

      await ticket.save();
      return ticket;
    } catch (error) {
      throw new Error(`Erreur lors de la fermeture: ${error.message}`);
    }
  }

  // Escalader un ticket
  async escalateTicket(ticketId) {
    try {
      const ticket = await TicketModel.findById(ticketId);

      if (!ticket) {
        throw new Error('Ticket non trouvé');
      }

      ticket.status = 'escalade';
      ticket.priority = 'urgente';
      ticket.escalatedAt = new Date();

      await ticket.save();
      return ticket;
    } catch (error) {
      throw new Error(`Erreur lors de l\'escalade: ${error.message}`);
    }
  }

  // Obtenir les tickets en attente (pour les admins)
  async getPendingTickets(options = {}) {
    try {
      const { page = 1, limit = 10 } = options;

      return await this.findAll(
        { status: { $in: ['ouvert', 'escalade'] } },
        {
          page,
          limit,
          populate: 'createdBy group',
          sort: '-priority -createdAt'
        }
      );
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des tickets en attente: ${error.message}`);
    }
  }
}

export default new TicketService();


