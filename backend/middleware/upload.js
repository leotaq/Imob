const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Criar diretório de uploads se não existir
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { tipo } = req.params; // 'solicitacoes', 'orcamentos', etc.
    const uploadPath = path.join(uploadsDir, tipo || 'geral');
    
    // Criar subdiretório se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Gerar nome único: timestamp_userId_originalname
    const timestamp = Date.now();
    const userId = req.usuario?.id || 'anonimo';
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50);
    
    const filename = `${timestamp}_${userId}_${name}${ext}`;
    cb(null, filename);
  }
});

// Filtro de tipos de arquivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'text/plain': '.txt'
  };
  
  if (allowedTypes[file.mimetype]) {
    logger.info('Arquivo aceito para upload', {
      filename: file.originalname,
      mimetype: file.mimetype,
      userId: req.usuario?.id
    });
    cb(null, true);
  } else {
    logger.logError('Tipo de arquivo não permitido', new Error('Invalid file type'), {
      filename: file.originalname,
      mimetype: file.mimetype,
      userId: req.usuario?.id
    });
    cb(new Error('Tipo de arquivo não permitido. Formatos aceitos: JPG, PNG, GIF, WebP, PDF, DOC, DOCX, XLS, XLSX, TXT'), false);
  }
};

// Configuração do multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // máximo 5 arquivos por vez
  }
});

// Middleware para tratamento de erros do multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      logger.logError('Arquivo muito grande', err, { userId: req.usuario?.id });
      return res.status(400).json({ error: 'Arquivo muito grande. Tamanho máximo: 10MB' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      logger.logError('Muitos arquivos', err, { userId: req.usuario?.id });
      return res.status(400).json({ error: 'Muitos arquivos. Máximo: 5 arquivos por vez' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      logger.logError('Campo de arquivo inesperado', err, { userId: req.usuario?.id });
      return res.status(400).json({ error: 'Campo de arquivo inesperado' });
    }
  }
  
  if (err.message.includes('Tipo de arquivo não permitido')) {
    return res.status(400).json({ error: err.message });
  }
  
  logger.logError('Erro no upload', err, { userId: req.usuario?.id });
  res.status(500).json({ error: 'Erro interno no upload' });
};

module.exports = {
  upload,
  handleUploadError,
  uploadsDir
};