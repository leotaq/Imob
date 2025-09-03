const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

class SocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  initialize(server) {
    const isProd = process.env.NODE_ENV === 'production';
    const defaultOrigins = isProd 
      ? 'https://imob-v1.vercel.app,https://imobigestor.vercel.app'
      : 'http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173';
    
    const allowedOrigins = (process.env.CORS_ORIGIN || defaultOrigins)
      .split(',')
      .map(o => o.trim())
      .filter(Boolean);

    this.io = new Server(server, {
      cors: {
        origin: isProd ? allowedOrigins : true,
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.io.use(this.authenticateSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));
    
    logger.info('Socket.IO inicializado com sucesso');
  }

  authenticateSocket(socket, next) {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      logger.logAuth('Socket: Token não fornecido', { socketId: socket.id });
      return next(new Error('Token não fornecido'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo_super_secreto');
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;
      socket.empresaId = decoded.empresaId;
      next();
    } catch (err) {
      logger.logAuth('Socket: Token inválido', { error: err.message, socketId: socket.id });
      next(new Error('Token inválido'));
    }
  }

  handleConnection(socket) {
    const userId = socket.userId;
    
    // Armazenar conexão do usuário
    this.connectedUsers.set(userId, {
      socketId: socket.id,
      email: socket.userEmail,
      empresaId: socket.empresaId,
      connectedAt: new Date()
    });

    logger.logAuth('Usuário conectado via Socket', {
      userId,
      email: socket.userEmail,
      socketId: socket.id
    });

    // Entrar na sala da empresa
    socket.join(`empresa_${socket.empresaId}`);
    
    // Eventos do socket
    socket.on('disconnect', () => this.handleDisconnection(socket));
    socket.on('join_solicitacao', (solicitacaoId) => this.joinSolicitacao(socket, solicitacaoId));
    socket.on('leave_solicitacao', (solicitacaoId) => this.leaveSolicitacao(socket, solicitacaoId));
  }

  handleDisconnection(socket) {
    const userId = socket.userId;
    this.connectedUsers.delete(userId);
    
    logger.logAuth('Usuário desconectado via Socket', {
      userId,
      email: socket.userEmail,
      socketId: socket.id
    });
  }

  joinSolicitacao(socket, solicitacaoId) {
    socket.join(`solicitacao_${solicitacaoId}`);
    logger.info('Usuário entrou na sala da solicitação', {
      userId: socket.userId,
      solicitacaoId
    });
  }

  leaveSolicitacao(socket, solicitacaoId) {
    socket.leave(`solicitacao_${solicitacaoId}`);
    logger.info('Usuário saiu da sala da solicitação', {
      userId: socket.userId,
      solicitacaoId
    });
  }

  // Métodos para enviar notificações
  notifyUser(userId, event, data) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      this.io.to(user.socketId).emit(event, data);
      logger.info('Notificação enviada para usuário', { userId, event, data });
    }
  }

  notifyEmpresa(empresaId, event, data) {
    this.io.to(`empresa_${empresaId}`).emit(event, data);
    logger.info('Notificação enviada para empresa', { empresaId, event, data });
  }

  notifySolicitacao(solicitacaoId, event, data) {
    this.io.to(`solicitacao_${solicitacaoId}`).emit(event, data);
    logger.info('Notificação enviada para solicitação', { solicitacaoId, event, data });
  }

  // Tipos específicos de notificações
  notifyStatusChange(solicitacaoId, novoStatus, empresaId) {
    const notification = {
      type: 'status_change',
      solicitacaoId,
      novoStatus,
      timestamp: new Date(),
      message: `Status da solicitação alterado para: ${novoStatus}`
    };
    
    this.notifySolicitacao(solicitacaoId, 'solicitacao_status_changed', notification);
    this.notifyEmpresa(empresaId, 'solicitacao_updated', notification);
  }

  notifyNewOrcamento(solicitacaoId, orcamento, empresaId) {
    const notification = {
      type: 'new_orcamento',
      solicitacaoId,
      orcamento,
      timestamp: new Date(),
      message: `Novo orçamento recebido para a solicitação`
    };
    
    this.notifySolicitacao(solicitacaoId, 'new_orcamento', notification);
    this.notifyEmpresa(empresaId, 'orcamento_created', notification);
  }

  notifyNewSolicitacao(solicitacao, empresaId) {
    const notification = {
      type: 'new_solicitacao',
      solicitacao,
      timestamp: new Date(),
      message: `Nova solicitação criada: ${solicitacao.titulo}`
    };
    
    this.notifyEmpresa(empresaId, 'solicitacao_created', notification);
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.entries()).map(([userId, data]) => ({
      userId,
      ...data
    }));
  }
}

module.exports = new SocketManager();