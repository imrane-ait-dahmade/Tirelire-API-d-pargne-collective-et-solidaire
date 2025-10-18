import mongoose from "mongoose";

const RoundSchema = new mongoose.Schema({
  group: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Group", 
    required: true 
  },
  roundNumber: { 
    type: Number, 
    required: true 
  },
  startDate: { 
    type: Date, 
    default: Date.now 
  },
  endDate: { 
    type: Date 
  },
  expectedEndDate: { 
    type: Date, 
    required: true 
  },
  
  // Bénéficiaire du tour
  beneficiary: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    position: { type: Number, required: true },
    received: { type: Boolean, default: false },
    receivedAt: Date,
    receivedAmount: { type: Number, default: 0 }
  },

  // Participants et leurs contributions
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    contributionAmount: { type: Number, required: true },
    hasPaid: { type: Boolean, default: false },
    paidAt: Date,
    paymentStatus: { 
      type: String, 
      enum: ['en_attente', 'paye_a_temps', 'paye_en_retard', 'non_paye'], 
      default: 'en_attente' 
    },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }
  }],

  // Montants
  totalAmount: { 
    type: Number, 
    required: true 
  },
  collectedAmount: { 
    type: Number, 
    default: 0 
  },
  distributedAmount: { 
    type: Number, 
    default: 0 
  },

  // Statut du tour
  status: { 
    type: String, 
    enum: ["en_attente", "en_cours", "termine", "annule"], 
    default: "en_attente" 
  },

  // Notifications envoyées
  notificationsSent: [{
    type: { type: String, enum: ['reminder', 'late', 'completed'] },
    sentAt: { type: Date, default: Date.now },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }]
}, { 
  timestamps: true 
});

// Index pour améliorer les performances
RoundSchema.index({ group: 1, roundNumber: 1 });
RoundSchema.index({ 'beneficiary.userId': 1 });
RoundSchema.index({ status: 1 });

// Méthode pour vérifier si tous les participants ont payé
RoundSchema.methods.allPaid = function() {
  return this.participants.every(p => p.hasPaid);
};

// Méthode pour obtenir le pourcentage de collecte
RoundSchema.methods.getCollectionPercentage = function() {
  if (this.totalAmount === 0) return 0;
  return Math.round((this.collectedAmount / this.totalAmount) * 100);
};

// Méthode pour obtenir les participants en retard
RoundSchema.methods.getLateParticipants = function() {
  const now = new Date();
  return this.participants.filter(p => 
    !p.hasPaid && this.expectedEndDate < now
  );
};

const RoundModel = mongoose.model("Round", RoundSchema);

export default RoundModel;
