import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  // Groupe concerné
  group: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group', 
    required: true 
  },

  // Expéditeur
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // Type de message
  messageType: {
    type: String,
    enum: ['text', 'audio', 'image', 'file', 'system'],
    default: 'text'
  },

  // Contenu du message
  content: {
    text: String,
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    duration: Number, // Pour les messages audio (en secondes)
    mimeType: String
  },

  // Message système (pour les notifications automatiques)
  isSystemMessage: {
    type: Boolean,
    default: false
  },

  systemMessageType: {
    type: String,
    enum: ['user_joined', 'user_left', 'round_started', 'round_completed', 'payment_received', 'payment_late']
  },

  // Lecture
  readBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],

  // Réponse à un message (threading)
  replyTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Message' 
  },

  // Réactions
  reactions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emoji: String,
    createdAt: { type: Date, default: Date.now }
  }],

  // Suppression
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true 
});

// Index
MessageSchema.index({ group: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ isDeleted: 1 });

// Méthode pour marquer comme lu par un utilisateur
MessageSchema.methods.markAsRead = function(userId) {
  const alreadyRead = this.readBy.some(r => r.userId.toString() === userId.toString());
  
  if (!alreadyRead) {
    this.readBy.push({
      userId,
      readAt: new Date()
    });
  }
};

// Méthode pour ajouter une réaction
MessageSchema.methods.addReaction = function(userId, emoji) {
  // Retirer l'ancienne réaction du même utilisateur s'il y en a une
  this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
  
  // Ajouter la nouvelle réaction
  this.reactions.push({
    userId,
    emoji,
    createdAt: new Date()
  });
};

// Méthode pour supprimer (soft delete)
MessageSchema.methods.softDelete = function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
};

const MessageModel = mongoose.model("Message", MessageSchema);

export default MessageModel;


