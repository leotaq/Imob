const logger = require('../utils/logger');

// Middleware para logar todas as requisições
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Interceptar o final da resposta
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);
    originalSend.call(this, data);
  };
  
  next();
};

// Middleware para capturar erros
const errorLogger = (error, req, res, next) => {
  logger.logError(error, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.usuario?.id || 'anonymous',
    body: req.body,
    params: req.params,
    query: req.query
  });
  
  next(error);
};

module.exports = {
  requestLogger,
  errorLogger
};