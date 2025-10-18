import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  group: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Group", 
    required: true 
  },
  round: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Round", 
    required: true 
  },
  
  // Émetteur et destinataire
  payer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  
  // Montant et type
  amount: { 
    type: Number, 
    required: true,
    min: [0, 'Le montant doit être positif']
  },
  type: { 
    type: String, 
    enum: ["contribution", "distribution", "penalite"], 
    required: true 
  },
  
  // Statut de la transaction
  status: { 
    type: String, 
    enum: ["en_attente", "confirmee", "echouee", "annulee"], 
    default: "en_attente" 
  },
  
  // Référence unique de la transaction
  reference: { 
    type: String, 
    unique: true,
    required: true 
  },
  
  // Métadonnées de paiement
  paymentMethod: { 
    type: String, 
    enum: ['especes', 'virement', 'mobile_money', 'carte_bancaire'],
    required: true 
  },
  
  // Informations de traçabilité
  metadata: {
    externalTransactionId: String,
    provider: String,
    ipAddress: String,
    userAgent: String,
    receiptUrl: String
  },

  // Dates importantes
  confirmedAt: Date,
  failedAt: Date,
  failureReason: String,

  // Historique des tentatives
  attempts: [{
    attemptedAt: { type: Date, default: Date.now },
    status: String,
    errorMessage: String
  }],

  // Pour la traçabilité et résolution de litiges
  dispute: {
    isDisputed: { type: Boolean, default: false },
    disputedAt: Date,
    disputedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    disputeReason: String,
    disputeStatus: { 
      type: String, 
      enum: ['en_cours', 'resolu', 'rejete'] 
    },
    resolvedAt: Date,
    resolution: String
  }
}, { 
  timestamps: true 
});

// Générer une référence unique avant la sauvegarde
TransactionSchema.pre('save', function(next) {
  if (!this.reference) {
    this.reference = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Index pour améliorer les performances
TransactionSchema.index({ group: 1, round: 1 });
TransactionSchema.index({ payer: 1, status: 1 });
TransactionSchema.index({ reference: 1 }, { unique: true });
TransactionSchema.index({ createdAt: -1 });

// Méthode pour confirmer la transaction
TransactionSchema.methods.confirm = function() {
  this.status = 'confirmee';
  this.confirmedAt = new Date();
};

// Méthode pour marquer comme échouée
TransactionSchema.methods.fail = function(reason) {
  this.status = 'echouee';
  this.failedAt = new Date();
  this.failureReason = reason;
};

const TransactionModel = mongoose.model("Transaction", TransactionSchema);

export default TransactionModel;
