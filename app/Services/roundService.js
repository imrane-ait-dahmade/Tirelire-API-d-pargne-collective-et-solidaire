import RoundModel from "../Models/Round.js";
import GroupModel from "../Models/Group.js";
import BaseService from './BaseService.js';

class RoundService extends BaseService {
  constructor() {
    super(RoundModel);
  }

  // Créer un nouveau tour
  async createRound(groupId, sortedMembers) {
    try {
      const group = await GroupModel.findById(groupId).populate('members.userId');
      
      if (!group) {
        throw new Error('Groupe non trouvé');
      }

      // Récupérer le dernier numéro de tour
      const lastRound = await RoundModel.findOne({ group: groupId })
        .sort('-roundNumber')
        .limit(1);

      const roundNumber = lastRound ? lastRound.roundNumber + 1 : 1;

      // Déterminer le bénéficiaire (le prochain dans l'ordre)
      const beneficiaryIndex = (roundNumber - 1) % sortedMembers.length;
      const beneficiary = sortedMembers[beneficiaryIndex];

      // Calculer la date de fin attendue
      const daysPerRound = group.contributionSettings.frequency === 'hebdomadaire' ? 7 :
                           group.contributionSettings.frequency === 'bimensuel' ? 15 : 30;
      
      const expectedEndDate = new Date();
      expectedEndDate.setDate(expectedEndDate.getDate() + daysPerRound);

      // Créer les participants
      const participants = sortedMembers.map(member => ({
        userId: member._id,
        contributionAmount: group.contributionSettings.amount,
        hasPaid: false,
        paymentStatus: 'en_attente'
      }));

      // Créer le tour
      const round = new RoundModel({
        group: groupId,
        roundNumber,
        beneficiary: {
          userId: beneficiary._id,
          position: beneficiaryIndex + 1,
          received: false
        },
        participants,
        totalAmount: group.contributionSettings.amount * sortedMembers.length,
        collectedAmount: 0,
        distributedAmount: 0,
        expectedEndDate,
        status: 'en_cours'
      });

      await round.save();

      // Mettre à jour le groupe
      group.currentRound = round._id;
      group.totalRounds += 1;
      await group.save();

      return round;
    } catch (error) {
      throw new Error(`Erreur lors de la création du tour: ${error.message}`);
    }
  }

  // Obtenir les tours d'un groupe
  async getGroupRounds(groupId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;

      const rounds = await RoundModel.find({ group: groupId })
        .populate('beneficiary.userId', 'firstName lastName')
        .populate('participants.userId', 'firstName lastName reliabilityScore.score')
        .sort('-roundNumber')
        .limit(limit)
        .skip((page - 1) * limit);

      const total = await RoundModel.countDocuments({ group: groupId });

      return {
        data: rounds,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des tours: ${error.message}`);
    }
  }

  // Obtenir le tour actuel d'un groupe
  async getCurrentRound(groupId) {
    try {
      const round = await RoundModel.findOne({ 
        group: groupId, 
        status: 'en_cours' 
      })
      .populate('beneficiary.userId', 'firstName lastName email')
      .populate('participants.userId', 'firstName lastName email reliabilityScore.score');

      return round;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du tour actuel: ${error.message}`);
    }
  }

  // Marquer un paiement comme effectué
  async markPaymentDone(roundId, userId, transactionId) {
    try {
      const round = await RoundModel.findById(roundId);
      
      if (!round) {
        throw new Error('Tour non trouvé');
      }

      const participantIndex = round.participants.findIndex(
        p => p.userId.toString() === userId.toString()
      );

      if (participantIndex === -1) {
        throw new Error('Participant non trouvé');
      }

      const participant = round.participants[participantIndex];

      if (participant.hasPaid) {
        throw new Error('Le paiement a déjà été effectué');
      }

      // Vérifier si le paiement est à temps ou en retard
      const now = new Date();
      const isLate = now > round.expectedEndDate;

      participant.hasPaid = true;
      participant.paidAt = now;
      participant.paymentStatus = isLate ? 'paye_en_retard' : 'paye_a_temps';
      participant.transactionId = transactionId;

      // Mettre à jour le montant collecté
      round.collectedAmount += participant.contributionAmount;

      // Vérifier si tous ont payé
      if (round.allPaid()) {
        round.status = 'termine';
        round.endDate = new Date();
        
        // Marquer le bénéficiaire comme ayant reçu
        round.beneficiary.received = true;
        round.beneficiary.receivedAt = new Date();
        round.beneficiary.receivedAmount = round.collectedAmount;
        round.distributedAmount = round.collectedAmount;

        // Mettre à jour le groupe
        const group = await GroupModel.findById(round.group);
        group.totalCollected += round.collectedAmount;
        group.totalDistributed += round.distributedAmount;
        await group.save();
      }

      await round.save();

      return round;
    } catch (error) {
      throw new Error(`Erreur lors du marquage du paiement: ${error.message}`);
    }
  }

  // Compléter un tour et créer le suivant
  async completeRoundAndCreateNext(roundId) {
    try {
      const round = await RoundModel.findById(roundId).populate({
        path: 'group',
        populate: { path: 'members.userId' }
      });

      if (!round) {
        throw new Error('Tour non trouvé');
      }

      if (round.status !== 'en_cours') {
        throw new Error('Le tour n\'est pas en cours');
      }

      // Marquer le tour comme terminé
      round.status = 'termine';
      round.endDate = new Date();
      await round.save();

      // Vérifier s'il faut créer un nouveau tour
      const group = round.group;
      const activeMembersCount = group.getActiveMembersCount();

      if (round.roundNumber < activeMembersCount) {
        // Créer le tour suivant
        const sortedMembers = group.members
          .filter(m => m.status === 'active')
          .map(m => m.userId)
          .sort((a, b) => a.reliabilityScore.score - b.reliabilityScore.score);

        await this.createRound(group._id, sortedMembers);
      } else {
        // Tous les tours sont terminés
        group.status = 'termine';
        group.actualEndDate = new Date();
        await group.save();
      }

      return round;
    } catch (error) {
      throw new Error(`Erreur lors de la complétion du tour: ${error.message}`);
    }
  }

  // Obtenir les participants en retard
  async getLateParticipants(roundId) {
    try {
      const round = await RoundModel.findById(roundId)
        .populate('participants.userId', 'firstName lastName email');

      if (!round) {
        throw new Error('Tour non trouvé');
      }

      return round.getLateParticipants();
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des retardataires: ${error.message}`);
    }
  }

  // Obtenir les statistiques d'un tour
  async getRoundStats(roundId) {
    try {
      const round = await RoundModel.findById(roundId);

      if (!round) {
        throw new Error('Tour non trouvé');
      }

      const paidCount = round.participants.filter(p => p.hasPaid).length;
      const totalParticipants = round.participants.length;
      const collectionPercentage = round.getCollectionPercentage();
      const lateCount = round.getLateParticipants().length;

      return {
        roundNumber: round.roundNumber,
        status: round.status,
        totalAmount: round.totalAmount,
        collectedAmount: round.collectedAmount,
        distributedAmount: round.distributedAmount,
        collectionPercentage,
        paidCount,
        totalParticipants,
        lateCount,
        startDate: round.startDate,
        expectedEndDate: round.expectedEndDate,
        endDate: round.endDate
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }
}

export default new RoundService();


