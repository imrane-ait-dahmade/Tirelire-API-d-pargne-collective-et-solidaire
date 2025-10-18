import jwt from 'jsonwebtoken';
import UserModel from '../Models/User.js';
import BaseService from './BaseService.js';

class AuthService extends BaseService {
  constructor() {
    super(UserModel);
  }

  // Inscription d'un nouvel utilisateur
  async register(userData) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await UserModel.findOne({ email: userData.email });
      
      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // Créer le nouvel utilisateur
      const user = new UserModel({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        role: userData.role || 'Particulier'
      });

      await user.save();

      // Générer un token JWT
      const token = this.generateToken(user);

      return {
        user: user.toPublicProfile(),
        token
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'inscription: ${error.message}`);
    }
  }

  // Connexion d'un utilisateur
  async login(email, password) {
    try {
      // Trouver l'utilisateur
      const user = await UserModel.findOne({ email }).select('+password');
      
      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérifier le mot de passe
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérifier si le compte est actif
      if (!user.isActive) {
        throw new Error('Votre compte a été désactivé');
      }

      // Mettre à jour la dernière connexion
      user.lastLogin = new Date();
      await user.save();

      // Générer un token JWT
      const token = this.generateToken(user);

      return {
        user: user.toPublicProfile(),
        token
      };
    } catch (error) {
      throw new Error(`Erreur lors de la connexion: ${error.message}`);
    }
  }

  // Générer un token JWT
  generateToken(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      kycStatus: user.kyc.status
    };

    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // Vérifier un token JWT
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  // Rafraîchir le token
  async refreshToken(oldToken) {
    try {
      const decoded = this.verifyToken(oldToken);
      const user = await UserModel.findById(decoded.userId);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      return this.generateToken(user);
    } catch (error) {
      throw new Error(`Erreur lors du rafraîchissement du token: ${error.message}`);
    }
  }

  // Récupérer l'utilisateur actuel à partir du token
  async getCurrentUser(token) {
    try {
      const decoded = this.verifyToken(token);
      const user = await UserModel.findById(decoded.userId);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      return user;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`);
    }
  }

  // Changer le mot de passe
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await UserModel.findById(userId).select('+password');
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      const isPasswordValid = await user.comparePassword(oldPassword);
      
      if (!isPasswordValid) {
        throw new Error('Ancien mot de passe incorrect');
      }

      user.password = newPassword;
      await user.save();

      return { message: 'Mot de passe modifié avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors du changement de mot de passe: ${error.message}`);
    }
  }
}

export default new AuthService();


