import GroupService from '../../app/Services/groupeService.js';
import UserModel from '../../app/Models/User.js';

describe('GroupService', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await UserModel.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'Test123456',
      kyc: {
        status: 'verifie',
        faceVerification: {
          status: 'verified'
        }
      }
    });
  });

  describe('createGroup', () => {
    it('devrait créer un groupe avec succès', async () => {
      const groupData = {
        name: 'Test Group',
        description: 'Description du groupe de test',
        contributionSettings: {
          amount: 1000,
          frequency: 'mensuel',
          paymentDeadline: 15
        }
      };

      const group = await GroupService.createGroup(testUser._id, groupData);

      expect(group.name).toBe(groupData.name);
      expect(group.creator.toString()).toBe(testUser._id.toString());
      expect(group.members).toHaveLength(1);
      expect(group.status).toBe('en_attente');
    });

    it('devrait échouer si l\'utilisateur n\'est pas vérifié KYC', async () => {
      const unverifiedUser = await UserModel.create({
        firstName: 'Unverified',
        lastName: 'User',
        email: 'unverified@example.com',
        password: 'Test123456'
      });

      const groupData = {
        name: 'Test Group',
        contributionSettings: {
          amount: 1000,
          frequency: 'mensuel',
          paymentDeadline: 15
        }
      };

      await expect(
        GroupService.createGroup(unverifiedUser._id, groupData)
      ).rejects.toThrow('vérification KYC');
    });
  });

  describe('getUserGroups', () => {
    it('devrait récupérer les groupes de l\'utilisateur', async () => {
      // Créer un groupe
      await GroupService.createGroup(testUser._id, {
        name: 'Test Group',
        contributionSettings: {
          amount: 1000,
          frequency: 'mensuel',
          paymentDeadline: 15
        }
      });

      const groups = await GroupService.getUserGroups(testUser._id);

      expect(groups).toHaveLength(1);
      expect(groups[0].name).toBe('Test Group');
    });
  });

  describe('addMember', () => {
    let group;
    let newUser;

    beforeEach(async () => {
      group = await GroupService.createGroup(testUser._id, {
        name: 'Test Group',
        contributionSettings: {
          amount: 1000,
          frequency: 'mensuel',
          paymentDeadline: 15
        }
      });

      newUser = await UserModel.create({
        firstName: 'New',
        lastName: 'Member',
        email: 'newmember@example.com',
        password: 'Test123456',
        kyc: {
          status: 'verifie',
          faceVerification: {
            status: 'verified'
          }
        }
      });
    });

    it('devrait ajouter un membre au groupe', async () => {
      const updatedGroup = await GroupService.addMember(
        group._id,
        newUser._id,
        testUser._id
      );

      expect(updatedGroup.members).toHaveLength(2);
    });

    it('devrait échouer si l\'utilisateur n\'est pas admin', async () => {
      const nonAdmin = await UserModel.create({
        firstName: 'Non',
        lastName: 'Admin',
        email: 'nonadmin@example.com',
        password: 'Test123456'
      });

      await expect(
        GroupService.addMember(group._id, newUser._id, nonAdmin._id)
      ).rejects.toThrow('administrateurs');
    });

    it('devrait échouer si le nouveau membre n\'est pas vérifié KYC', async () => {
      const unverifiedUser = await UserModel.create({
        firstName: 'Unverified',
        lastName: 'User',
        email: 'unverified2@example.com',
        password: 'Test123456'
      });

      await expect(
        GroupService.addMember(group._id, unverifiedUser._id, testUser._id)
      ).rejects.toThrow('KYC');
    });
  });
});


