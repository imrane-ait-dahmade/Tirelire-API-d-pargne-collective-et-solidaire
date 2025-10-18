import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Le nom du groupe est requis'],
    trim: true,
    minlength: [3, 'Le nom doit contenir au moins 3 caractères']
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  
  // Créateur et administrateur du groupe
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  admin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // Membres du groupe
  members: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    joinedAt: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['active', 'suspended', 'left'], 
      default: 'active' 
    },
    role: { 
      type: String, 
      enum: ['member', 'admin'], 
      default: 'member' 
    }
  }],

  // Configuration des contributions
  contributionSettings: {
    amount: { 
      type: Number, 
      required: [true, 'Le montant de contribution est requis'],
      min: [1, 'Le montant doit être supérieur à 0']
    },
    frequency: { 
      type: String, 
      enum: ['hebdomadaire', 'bimensuel', 'mensuel'], 
      required: true 
    },
    paymentDeadline: { 
      type: Number, 
      required: true,
      min: 1,
      max: 31,
      comment: 'Jour du mois ou de la semaine pour le paiement'
    },
    currency: { type: String, default: 'MAD' }
  },

  // Règles du groupe
  rules: {
    minReliabilityScore: { type: Number, default: 30, min: 0, max: 100 },
    latePenalty: { type: Number, default: 0 },
    maxMembers: { type: Number, default: 12, min: 2, max: 50 },
    requireApproval: { type: Boolean, default: false }
  },

  // Statut du groupe
  status: { 
    type: String, 
    enum: ['en_attente', 'actif', 'termine', 'suspendu'], 
    default: 'en_attente' 
  },

  // Tours de contribution
  currentRound: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Round' 
  },
  totalRounds: { type: Number, default: 0 },

  // Informations financières
  totalCollected: { type: Number, default: 0 },
  totalDistributed: { type: Number, default: 0 },

  // Dates importantes
  startDate: Date,
  expectedEndDate: Date,
  actualEndDate: Date,

  // Paramètres de communication
  allowMessages: { type: Boolean, default: true },
  allowAudioMessages: { type: Boolean, default: true }
}, { 
  timestamps: true 
});

// Index pour améliorer les performances
GroupSchema.index({ creator: 1, status: 1 });
GroupSchema.index({ 'members.userId': 1 });

// Méthode pour vérifier si un utilisateur est membre du groupe
GroupSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.userId.toString() === userId.toString() && member.status === 'active'
  );
};

// Méthode pour vérifier si un utilisateur est admin
GroupSchema.methods.isAdmin = function(userId) {
  return this.admin.toString() === userId.toString() || 
         this.members.some(member => 
           member.userId.toString() === userId.toString() && 
           member.role === 'admin' &&
           member.status === 'active'
         );
};

// Méthode pour obtenir le nombre de membres actifs
GroupSchema.methods.getActiveMembersCount = function() {
  return this.members.filter(member => member.status === 'active').length;
};

// Méthode pour vérifier si le groupe peut démarrer
GroupSchema.methods.canStart = function() {
  const activeMembersCount = this.getActiveMembersCount();
  return activeMembersCount >= 2 && this.status === 'en_attente';
};

const GroupModel = mongoose.model("Group", GroupSchema);

export default GroupModel;
