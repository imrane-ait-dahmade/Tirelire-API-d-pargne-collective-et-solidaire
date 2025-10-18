import TicketService from "../../Services/TicketService.js";
import BaseController from "./BaseController.js";

class TicketController extends BaseController {
  // Créer un nouveau ticket
  async createTicket(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await TicketService.createTicket({
          ...req.body,
          createdBy: req.user._id
        });
      },
      'Ticket créé avec succès'
    );
  }

  // Obtenir les tickets d'un groupe
  async getGroupTickets(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { page, limit, status } = req.query;
        return await TicketService.getGroupTickets(req.params.groupId, {
          page,
          limit,
          status
        });
      },
      'Tickets récupérés avec succès'
    );
  }

  // Obtenir les tickets de l'utilisateur
  async getUserTickets(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { page, limit } = req.query;
        return await TicketService.getUserTickets(req.user._id, {
          page,
          limit
        });
      },
      'Tickets récupérés avec succès'
    );
  }

  // Obtenir les tickets assignés (Admin)
  async getAssignedTickets(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { page, limit, status } = req.query;
        return await TicketService.getAssignedTickets(req.user._id, {
          page,
          limit,
          status
        });
      },
      'Tickets assignés récupérés avec succès'
    );
  }

  // Assigner un ticket (Admin)
  async assignTicket(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { adminId } = req.body;
        return await TicketService.assignTicket(req.params.id, adminId);
      },
      'Ticket assigné avec succès'
    );
  }

  // Ajouter une réponse
  async addResponse(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { message } = req.body;
        const isAdmin = req.user.role === 'Admin';
        return await TicketService.addResponse(
          req.params.id,
          req.user._id,
          message,
          isAdmin
        );
      },
      'Réponse ajoutée avec succès'
    );
  }

  // Résoudre un ticket
  async resolveTicket(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { resolutionNote } = req.body;
        return await TicketService.resolveTicket(
          req.params.id,
          req.user._id,
          resolutionNote
        );
      },
      'Ticket résolu avec succès'
    );
  }

  // Fermer un ticket
  async closeTicket(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await TicketService.closeTicket(req.params.id, req.user._id);
      },
      'Ticket fermé avec succès'
    );
  }

  // Escalader un ticket
  async escalateTicket(req, res) {
    return this.handleRequest(
      res,
      async () => {
        return await TicketService.escalateTicket(req.params.id);
      },
      'Ticket escaladé avec succès'
    );
  }

  // Obtenir les tickets en attente (Admin)
  async getPendingTickets(req, res) {
    return this.handleRequest(
      res,
      async () => {
        const { page, limit } = req.query;
        return await TicketService.getPendingTickets({ page, limit });
      },
      'Tickets en attente récupérés avec succès'
    );
  }
}

export default new TicketController();


