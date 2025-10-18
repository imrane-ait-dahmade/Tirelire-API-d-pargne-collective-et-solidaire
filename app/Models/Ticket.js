import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  // Créateur du ticket
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // Groupe concerné
  group: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group', 
    required: true 
  },

  // Transaction liée (optionnel)
  relatedTransaction: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Transaction' 
  },

  // Informations du ticket
  title: { 
    type: String, 
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  
  description: { 
    type: String, 
    required: [true, 'La description est requise'],
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },

  category: {
    type: String,
    enum: ['paiement', 'litige', 'technique', 'autre'],
    required: true
  },

  priority: {
    type: String,
    enum: ['basse', 'moyenne', 'haute', 'urgente'],
    default: 'moyenne'
  },

  status: {
    type: String,
    enum: ['ouvert', 'en_cours', 'resolu', 'ferme', 'escalade'],
    default: 'ouvert'
  },

  // Assignation
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  assignedAt: Date,

  // Pièces jointes
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Commentaires/réponses
  responses: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isAdminResponse: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],

  // Résolution
  resolution: {
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
    resolutionNote: String
  },

  // Dates importantes
  closedAt: Date,
  escalatedAt: Date
}, { 
  timestamps: true 
});

// Index
TicketSchema.index({ group: 1, status: 1 });
TicketSchema.index({ createdBy: 1 });
TicketSchema.index({ assignedTo: 1, status: 1 });

// Méthode pour ajouter une réponse
TicketSchema.methods.addResponse = function(userId, message, isAdmin = false) {
  this.responses.push({
    author: userId,
    message,
    isAdminResponse: isAdmin
  });
  
  if (this.status === 'ouvert') {
    this.status = 'en_cours';
  }
};

// Méthode pour résoudre le ticket
TicketSchema.methods.resolve = function(userId, note) {
  this.status = 'resolu';
  this.resolution = {
    resolvedBy: userId,
    resolvedAt: new Date(),
    resolutionNote: note
  };
};

const TicketModel = mongoose.model("Ticket", TicketSchema);

export default TicketModel;


