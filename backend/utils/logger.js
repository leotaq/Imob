const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Criar diretório de logs se não existir
const logDir = process.env.LOG_FILE_PATH || './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configuração de formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Adicionar stack trace para erros
    if (stack) {
      log += `\n${stack}`;
    }
    
    // Adicionar metadados se existirem
    if (Object.keys(meta).length > 0) {
      log += `\nMetadata: ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Configuração de transports
const transports = [
  // Console para desenvolvimento
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      customFormat
    )
  }),
  
  // Arquivo para todos os logs
  new DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.json(),
      winston.format.timestamp()
    )
  }),
  
  // Arquivo separado para erros
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    level: 'error',
    format: winston.format.combine(
      winston.format.json(),
      winston.format.timestamp()
    )
  })
];

// Criar logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports,
  // Não sair do processo em caso de erro
  exitOnError: false
});

// Adicionar métodos de conveniência
logger.logRequest = (req, res, responseTime) => {
  const { method, url, ip, headers } = req;
  const { statusCode } = res;
  
  logger.info('HTTP Request', {
    method,
    url,
    ip,
    userAgent: headers['user-agent'],
    statusCode,
    responseTime: `${responseTime}ms`,
    userId: req.usuario?.id || 'anonymous'
  });
};

logger.logError = (error, context = {}) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context
  });
};

logger.logAuth = (action, userId, success, details = {}) => {
  logger.info(`Auth: ${action}`, {
    userId,
    success,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.logDatabase = (operation, table, success, details = {}) => {
  logger.info(`Database: ${operation}`, {
    table,
    success,
    timestamp: new Date().toISOString(),
    ...details
  });
};

module.exports = logger;