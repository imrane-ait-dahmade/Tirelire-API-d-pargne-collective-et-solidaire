import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Créer le dossier uploads s'il n'existe pas
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === 'nationalIdImage' ? 'uploads/kyc/ids' : 
                   file.fieldname === 'selfieImage' ? 'uploads/kyc/selfies' :
                   'uploads/files';
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// Filtrage des fichiers
const fileFilter = (req, file, cb) => {
  // Types de fichiers autorisés
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedAudioTypes = /mp3|wav|ogg|m4a/;
  const allowedDocTypes = /pdf|doc|docx/;

  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  // Vérifier selon le champ
  if (file.fieldname === 'nationalIdImage' || file.fieldname === 'selfieImage') {
    if (allowedImageTypes.test(ext) && mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées pour le KYC'), false);
    }
  } else if (file.fieldname === 'audioMessage') {
    if (allowedAudioTypes.test(ext) && mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers audio sont autorisés'), false);
    }
  } else {
    cb(null, true);
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
  fileFilter: fileFilter
});

// Middlewares pour différents types d'upload
export const uploadKYC = upload.fields([
  { name: 'nationalIdImage', maxCount: 1 },
  { name: 'selfieImage', maxCount: 1 }
]);

export const uploadAudio = upload.single('audioMessage');

export const uploadFile = upload.single('file');

export const uploadMultiple = upload.array('files', 5);

// Middleware de gestion des erreurs d'upload
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Le fichier est trop volumineux (max 10 MB)'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Erreur d'upload: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

export default {
  uploadKYC,
  uploadAudio,
  uploadFile,
  uploadMultiple,
  handleUploadError
};


