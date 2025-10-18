import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  // Destinataire
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // Type de notification
  type: {
    type: String,
    enum: [
      'payment_reminder',
      'payment_late',
      'payment_received',
      'round_started',
      'round_completed',
      'your_turn',
      'group_invitation',
      'ticket_update',
      'kyc_approved',
      'kyc_rejected',
      'new_message',
      'system'
    ],
    required: true
  },

  // Titre et contenu
  title: {
    type: String,
    required: true,
    maxlength: 200
  },

  message: {
    type: String,
    required: true,
    maxlength: 500
  },

  // Références
  relatedGroup: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group' 
  },
  relatedRound: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Round' 
  },
  relatedTransaction: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Transaction' 
  },
  relatedTicket: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ticket' 
  },

  // Données supplémentaires
  data: {
    type: mongoose.Schema.Types.Mixed
  },

  // État de la notification
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,

  // Canaux de notification
  channels: {
    email: { 
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    sms: { 
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    push: { 
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    }
  },

  // Priorité
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Expiration
  expiresAt: Date,
  isExpired: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Index
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ expiresAt: 1 });

// Méthode pour marquer comme lue
NotificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
};

// Méthode pour vérifier l'expiration
NotificationSchema.methods.checkExpiration = function() {
  if (this.expiresAt && this.expiresAt < new Date()) {
    this.isExpired = true;
  }
  return this.isExpired;
};

// Middleware pour gérer l'expiration automatique
NotificationSchema.pre('find', function() {
  this.where({ 
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  });
});

const NotificationModel = mongoose.model("Notification", NotificationSchema);

export default NotificationModel;


