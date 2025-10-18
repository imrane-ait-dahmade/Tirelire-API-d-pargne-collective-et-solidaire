import UserModel from '../../app/Models/User.js';

describe('User Model', () => {
  describe('Validation', () => {
    it('devrait créer un utilisateur valide', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await UserModel.create(userData);

      expect(user.firstName).toBe(userData.firstName);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe('Particulier');
    });

    it('devrait échouer sans email', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      };

      await expect(UserModel.create(userData)).rejects.toThrow();
    });

    it('devrait échouer avec un email invalide', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'invalid-email',
        password: 'password123'
      };

      await expect(UserModel.create(userData)).rejects.toThrow();
    });
  });

  describe('Méthodes', () => {
    let user;

    beforeEach(async () => {
      user = await UserModel.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123'
      });
    });

    it('devrait hasher le mot de passe', () => {
      expect(user.password).not.toBe('Password123');
      expect(user.password).toMatch(/^\$2[aby]\$/);
    });

    it('devrait comparer les mots de passe correctement', async () => {
      const isMatch = await user.comparePassword('Password123');
      const isNotMatch = await user.comparePassword('WrongPassword');

      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });

    it('canPerformSensitiveActions devrait retourner false par défaut', () => {
      expect(user.canPerformSensitiveActions()).toBe(false);
    });

    it('canPerformSensitiveActions devrait retourner true si KYC vérifié', async () => {
      user.kyc.status = 'verifie';
      user.kyc.faceVerification.status = 'verified';
      await user.save();

      expect(user.canPerformSensitiveActions()).toBe(true);
    });

    it('updateReliabilityScore devrait calculer le score correctement', () => {
      user.reliabilityScore.totalContributions = 10;
      user.reliabilityScore.onTimePayments = 8;
      user.reliabilityScore.latePayments = 1;
      user.reliabilityScore.missedPayments = 1;

      user.updateReliabilityScore();

      expect(user.reliabilityScore.score).toBeGreaterThan(0);
      expect(user.reliabilityScore.score).toBeLessThanOrEqual(100);
    });

    it('toPublicProfile devrait retourner les données publiques', () => {
      const profile = user.toPublicProfile();

      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('email');
      expect(profile).toHaveProperty('firstName');
      expect(profile).not.toHaveProperty('password');
    });
  });
});


