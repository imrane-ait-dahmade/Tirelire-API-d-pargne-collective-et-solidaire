import AuthService from '../../app/Services/AuthService.js';
import UserModel from '../../app/Models/User.js';

describe('AuthService', () => {
  describe('register', () => {
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Test123456',
        phone: '0612345678'
      };

      const result = await AuthService.register(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(userData.email);
      expect(result.user.firstName).toBe(userData.firstName);
    });

    it('devrait échouer si l\'email existe déjà', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Test123456'
      };

      await AuthService.register(userData);

      await expect(AuthService.register(userData)).rejects.toThrow(
        'Un utilisateur avec cet email existe déjà'
      );
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await AuthService.register({
        firstName: 'Test',
        lastName: 'User',
        email: 'login@example.com',
        password: 'Test123456'
      });
    });

    it('devrait connecter un utilisateur avec succès', async () => {
      const result = await AuthService.login('login@example.com', 'Test123456');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('login@example.com');
    });

    it('devrait échouer avec un email incorrect', async () => {
      await expect(
        AuthService.login('wrong@example.com', 'Test123456')
      ).rejects.toThrow('Email ou mot de passe incorrect');
    });

    it('devrait échouer avec un mot de passe incorrect', async () => {
      await expect(
        AuthService.login('login@example.com', 'WrongPassword')
      ).rejects.toThrow('Email ou mot de passe incorrect');
    });
  });

  describe('changePassword', () => {
    let userId;

    beforeEach(async () => {
      const result = await AuthService.register({
        firstName: 'Test',
        lastName: 'User',
        email: 'change@example.com',
        password: 'OldPassword123'
      });
      userId = result.user.id;
    });

    it('devrait changer le mot de passe avec succès', async () => {
      const result = await AuthService.changePassword(
        userId,
        'OldPassword123',
        'NewPassword123'
      );

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('succès');
    });

    it('devrait échouer avec un ancien mot de passe incorrect', async () => {
      await expect(
        AuthService.changePassword(userId, 'WrongOld123', 'NewPassword123')
      ).rejects.toThrow('Ancien mot de passe incorrect');
    });
  });

  describe('verifyToken', () => {
    it('devrait vérifier un token valide', async () => {
      const result = await AuthService.register({
        firstName: 'Test',
        lastName: 'User',
        email: 'token@example.com',
        password: 'Test123456'
      });

      const decoded = AuthService.verifyToken(result.token);

      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('email');
      expect(decoded.email).toBe('token@example.com');
    });

    it('devrait échouer avec un token invalide', () => {
      expect(() => AuthService.verifyToken('invalid-token')).toThrow();
    });
  });
});


