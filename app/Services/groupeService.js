import GroupModel from "../Models/Group.js";
import UserModel from "../Models/User.js";
import RoundModel from "../Models/Round.js";
import BaseService from './BaseService.js';
import UserService from './userService.js';

class GroupService extends BaseService {
  constructor() {
    super(GroupModel);
  }

  // Créer un nouveau groupe
  async createGroup(userId, groupData) {
    try {
    
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      if (!user.canPerformSensitiveActions()) {
        throw new Error('Vous devez compléter votre vérification KYC pour créer un groupe');
      }

      const group = new GroupModel({
        name: groupData.name,
        description: groupData.description,
        creator: userId,
        admin: userId,
        contributionSettings: groupData.contributionSettings,
        rules: groupData.rules || {},
        members: [{
          userId: userId,
          role: 'admin',
          status: 'active'
        }]
      });

      await group.save();

      await UserService.addUserToGroup(userId, group._id);

      return group;
    } catch (error) {
      throw new Error(`Erreur lors de la création du groupe: ${error.message}`);
    }
  }

  async addMember(groupId, userId, requesterId) {
    try {
      const group = await GroupModel.findById(groupId);
      
      if (!group) {
        throw new Error('Groupe non trouvé');
      }

      if (!group.isAdmin(requesterId)) {
        throw new Error('Seuls les administrateurs peuvent ajouter des membres');
      }

      const newMember = await UserModel.findById(userId);
      
      if (!newMember) {
        throw new Error('Utilisateur non trouvé');
      }

      if (!newMember.canPerformSensitiveActions()) {
        throw new Error('L\'utilisateur doit compléter sa vérification KYC');
      }

      // Vérifier le score de fiabilité minimum
      if (newMember.reliabilityScore.score < group.rules.minReliabilityScore) {
        throw new Error(`Le score de fiabilité minimum requis est ${group.rules.minReliabilityScore}`);
      }

      // Vérifier le nombre maximum de membres
      if (group.getActiveMembersCount() >= group.rules.maxMembers) {
        throw new Error('Le groupe a atteint le nombre maximum de membres');
      }

      // Vérifier si l'utilisateur est déjà membre
      if (group.isMember(userId)) {
        throw new Error('L\'utilisateur est déjà membre du groupe');
      }

      // Ajouter le membre
      group.members.push({
        userId: userId,
        role: 'member',
        status: 'active'
      });

      await group.save();

      // Ajouter le groupe à l'utilisateur
      await UserService.addUserToGroup(userId, groupId);

      return group;
    } catch (error) {
      throw new Error(`Erreur lors de l'ajout du membre: ${error.message}`);
    }
  }

  // Retirer un membre du groupe
  async removeMember(groupId, userId, requesterId) {
    try {
      const group = await GroupModel.findById(groupId);
      
      if (!group) {
        throw new Error('Groupe non trouvé');
      }

      // Vérifier que le demandeur est admin ou que c'est lui-même
      if (!group.isAdmin(requesterId) && requesterId.toString() !== userId.toString()) {
        throw new Error('Non autorisé');
      }

      // Ne pas permettre de retirer le créateur
      if (group.creator.toString() === userId.toString()) {
        throw new Error('Le créateur ne peut pas quitter le groupe');
      }

      // Mettre à jour le statut du membre
      const memberIndex = group.members.findIndex(
        m => m.userId.toString() === userId.toString()
      );

      if (memberIndex === -1) {
        throw new Error('Membre non trouvé dans le groupe');
      }

      group.members[memberIndex].status = 'left';
      await group.save();

      // Retirer le groupe de l'utilisateur
      await UserService.removeUserFromGroup(userId, groupId);

      return group;
    } catch (error) {
      throw new Error(`Erreur lors du retrait du membre: ${error.message}`);
    }
  }

  // Démarrer le groupe et créer le premier tour
  async startGroup(groupId, userId) {
    try {
      const group = await GroupModel.findById(groupId).populate('members.userId');
      
      if (!group) {
        throw new Error('Groupe non trouvé');
      }

      // Vérifier que l'utilisateur est admin
      if (!group.isAdmin(userId)) {
        throw new Error('Seuls les administrateurs peuvent démarrer le groupe');
      }

      // Vérifier que le groupe peut démarrer
      if (!group.canStart()) {
        throw new Error('Le groupe ne peut pas démarrer (minimum 2 membres requis)');
      }

      if (group.status !== 'en_attente') {
        throw new Error('Le groupe est déjà démarré');
      }

      // Calculer l'ordre des participants basé sur le score de fiabilité
      const activeMembers = group.members
        .filter(m => m.status === 'active')
        .map(m => m.userId);

      // Trier par score de fiabilité (les moins fiables reçoivent en premier)
      const sortedMembers = activeMembers.sort((a, b) => 
        a.reliabilityScore.score - b.reliabilityScore.score
      );

      // Mettre à jour le statut du groupe
      group.status = 'actif';
      group.startDate = new Date();
      
      // Calculer la date de fin estimée
      const numberOfRounds = sortedMembers.length;
      const daysPerRound = group.contributionSettings.frequency === 'hebdomadaire' ? 7 :
                           group.contributionSettings.frequency === 'bimensuel' ? 15 : 30;
      
      const expectedEndDate = new Date();
      expectedEndDate.setDate(expectedEndDate.getDate() + (numberOfRounds * daysPerRound));
      group.expectedEndDate = expectedEndDate;

      await group.save();

      // Créer le premier tour
      const roundService = await import('./RoundService.js');
      await roundService.default.createRound(groupId, sortedMembers);

      return group;
    } catch (error) {
      throw new Error(`Erreur lors du démarrage du groupe: ${error.message}`);
    }
  }

  // Obtenir les groupes d'un utilisateur
  async getUserGroups(userId, status = 'active') {
    try {
      const groups = await GroupModel.find({
        'members.userId': userId,
        'members.status': status
      }).populate('admin creator currentRound');

      return groups;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des groupes: ${error.message}`);
    }
  }

  // Obtenir les détails d'un groupe
  async getGroupDetails(groupId, userId) {
    try {
      const group = await GroupModel.findById(groupId)
        .populate('members.userId', 'firstName lastName email reliabilityScore.score kyc.status')
        .populate('admin', 'firstName lastName email')
        .populate('currentRound');

      if (!group) {
        throw new Error('Groupe non trouvé');
      }

      // Vérifier que l'utilisateur est membre
      if (!group.isMember(userId) && !group.isAdmin(userId)) {
        throw new Error('Accès non autorisé');
      }

        return group;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des détails: ${error.message}`);
    }
  }

  // Mettre à jour les paramètres du groupe
  async updateGroupSettings(groupId, userId, updates) {
    try {
      const group = await GroupModel.findById(groupId);
      
      if (!group) {
        throw new Error('Groupe non trouvé');
      }

      // Vérifier que l'utilisateur est admin
      if (!group.isAdmin(userId)) {
        throw new Error('Seuls les administrateurs peuvent modifier les paramètres');
      }

      // Ne pas permettre de modifier si le groupe est actif
      if (group.status === 'actif') {
        throw new Error('Impossible de modifier un groupe actif');
      }

      // Mettre à jour les champs autorisés
      const allowedUpdates = ['description', 'rules', 'contributionSettings'];
      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          group[field] = { ...group[field], ...updates[field] };
        }
      });

      await group.save();
      return group;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  // Terminer le groupe
  async endGroup(groupId, userId) {
    try {
      const group = await GroupModel.findById(groupId);
      
      if (!group) {
        throw new Error('Groupe non trouvé');
      }

      // Vérifier que l'utilisateur est admin
      if (!group.isAdmin(userId)) {
        throw new Error('Seuls les administrateurs peuvent terminer le groupe');
      }

      group.status = 'termine';
      group.actualEndDate = new Date();
      
      await group.save();

      return group;
    } catch (error) {
      throw new Error(`Erreur lors de la clôture du groupe: ${error.message}`);
    }
  }
}

export default new GroupService();