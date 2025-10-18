import UserService from '../../app/Services/userService.js';
import UserModel from '../../app/Models/User.js';

describe('UserService', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await UserModel.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'Test123456'
    });
  });

  describe('getUserById', () => {
    it('devrait récupérer un utilisateur par ID', async () => {
      const user = await UserService.getUserById(testUser._id);

      expect(user.email).toBe(testUser.email);
      expect(user.firstName).toBe(testUser.firstName);
    });

    it('devrait échouer si l\'utilisateur n\'existe pas', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await expect(UserService.getUserById(fakeId)).rejects.toThrow();
    });
  });

  describe('getUserByEmail', () => {
    it('devrait récupérer un utilisateur par email', async () => {
      const user = await UserService.getUserByEmail(testUser.email);

      expect(user._id.toString()).toBe(testUser._id.toString());
      expect(user.firstName).toBe(testUser.firstName);
    });

    it('devrait échouer si l\'email n\'existe pas', async () => {
      await expect(
        UserService.getUserByEmail('nonexistent@example.com')
      ).rejects.toThrow('Utilisateur non trouvé');
    });
  });

  describe('updateProfile', () => {
    it('devrait mettre à jour le profil utilisateur', async () => {
      const updates = {
        firstName: 'Updated',
        phone: '0612345678'
      };

      const result = await UserService.updateProfile(testUser._id, updates);

      expect(result.firstName).toBe('Updated');
    });

    it('ne devrait pas permettre de modifier l\'email', async () => {
      const updates = {
        email: 'newemail@example.com'
      };

      const result = await UserService.updateProfile(testUser._id, updates);

      expect(result.email).toBe(testUser.email);
    });
  });

  describe('updateReliabilityScore', () => {
    it('devrait mettre à jour le score pour un paiement à temps', async () => {
      const result = await UserService.updateReliabilityScore(
        testUser._id,
        'paye_a_temps'
      );

      expect(result.totalContributions).toBe(1);
      expect(result.onTimePayments).toBe(1);
      expect(result.score).toBeGreaterThan(50);
    });

    it('devrait mettre à jour le score pour un paiement en retard', async () => {
      const result = await UserService.updateReliabilityScore(
        testUser._id,
        'paye_en_retard'
      );

      expect(result.totalContributions).toBe(1);
      expect(result.latePayments).toBe(1);
    });

    it('devrait mettre à jour le score pour un paiement manqué', async () => {
      const result = await UserService.updateReliabilityScore(
        testUser._id,
        'non_paye'
      );

      expect(result.totalContributions).toBe(1);
      expect(result.missedPayments).toBe(1);
      expect(result.score).toBeLessThan(50);
    });
  });

  describe('getUserStats', () => {
    it('devrait récupérer les statistiques utilisateur', async () => {
      const stats = await UserService.getUserStats(testUser._id);

      expect(stats).toHaveProperty('reliabilityScore');
      expect(stats).toHaveProperty('totalContributions');
      expect(stats).toHaveProperty('activeGroups');
      expect(stats).toHaveProperty('kycStatus');
    });
  });

  describe('deactivateUser / reactivateUser', () => {
    it('devrait désactiver un utilisateur', async () => {
      const result = await UserService.deactivateUser(testUser._id);

      const user = await UserModel.findById(testUser._id);
      expect(user.isActive).toBe(false);
    });

    it('devrait réactiver un utilisateur', async () => {
      await UserService.deactivateUser(testUser._id);
      const result = await UserService.reactivateUser(testUser._id);

      const user = await UserModel.findById(testUser._id);
      expect(user.isActive).toBe(true);
    });
  });
});


