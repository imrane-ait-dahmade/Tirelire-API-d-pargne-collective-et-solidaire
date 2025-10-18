import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Configuration de la base de données de test
const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/tirelire-test';

// Connexion avant tous les tests
beforeAll(async () => {
  await mongoose.connect(MONGO_TEST_URI);
});

// Nettoyage après tous les tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// Nettoyage après chaque test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});


