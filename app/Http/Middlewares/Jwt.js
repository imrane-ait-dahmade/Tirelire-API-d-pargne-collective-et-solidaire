import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

function Auth(req, res) {
  try {
   
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: 'Token non fourni' });
    }

 
    const jwt_secret = process.env.JWT_SECRET;
    if (!jwt_secret) {
      return res.status(500).json({ message: 'JWT_SECRET manquant dans .env' });
    }

    const decoded = jwt.verify(token, jwt_secret);
    req.user = decoded;
  } catch (error) {
    console.error('Erreur d authentification :', error.message);
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
}

export default Auth;
