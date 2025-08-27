const socketManager = require('./socketManager');
const logger = require('./logger');

class NotificationService {
  constructor() {
    this.notificationTypes = {
      SOLICITACAO_CREATED: 'solicitacao_created',
      SOLICITACAO_UPDATED: 'solicitacao_updated',
      STATUS_CHANGED: 'status_changed',
      NEW_ORCAMENTO: 'new_orcamento',
      ORCAMENTO_APPROVED: 'orcamento_approved',
      ORCAMENTO_REJECTED: 'orcamento_rejected',
      EXECUCAO_STARTED: 'execucao_started',
      EXECUCAO_COMPLETED: 'execucao_completed',
      PAYMENT_RECEIVED: 'payment_received',
      USER_ASSIGNED: 'user_assigned'
    };
  }

  // Notificação para nova solicitação
  async notifyNewSolicitacao(solicitacao, empresaId) {
    try {
      socketManager.notifyNewSolicitacao(solicitacao, empresaId);
      
      // Aqui você pode adicionar outras formas de notificação:
      // - Email
      // - SMS
      // - Push notifications
      
      logger.info('Notificação de nova solicitação enviada', {
        solicitacaoId: solicitacao.id,
        empresaId
      });
    } catch (error) {
      logger.logError('Erro ao enviar notificação de nova solicitação', error, {
        solicitacaoId: solicitacao.id,
        empresaId
      });
    }
  }

  // Notificação para mudança de status
  async notifyStatusChange(solicitacaoId, novoStatus, empresaId, userId) {
    try {
      socketManager.notifyStatusChange(solicitacaoId, novoStatus, empresaId);
      
      logger.info('Notificação de mudança de status enviada', {
        solicitacaoId,
        novoStatus,
        empresaId,
        userId
      });
    } catch (error) {
      logger.logError('Erro ao enviar notificação de mudança de status', error, {
        solicitacaoId,
        novoStatus,
        empresaId
      });
    }
  }

  // Notificação para novo orçamento
  async notifyNewOrcamento(solicitacaoId, orcamento, empresaId) {
    try {
      socketManager.notifyNewOrcamento(solicitacaoId, orcamento, empresaId);
      
      logger.info('Notificação de novo orçamento enviada', {
        solicitacaoId,
        orcamentoId: orcamento.id,
        empresaId
      });
    } catch (error) {
      logger.logError('Erro ao enviar notificação de novo orçamento', error, {
        solicitacaoId,
        orcamentoId: orcamento.id,
        empresaId
      });
    }
  }

  // Notificação personalizada
  async sendCustomNotification(userId, type, message, data = {}) {
    try {
      const notification = {
        type,
        message,
        data,
        timestamp: new Date()
      };
      
      socketManager.notifyUser(userId, 'custom_notification', notification);
      
      logger.info('Notificação personalizada enviada', {
        userId,
        type,
        message
      });
    } catch (error) {
      logger.logError('Erro ao enviar notificação personalizada', error, {
        userId,
        type,
        message
      });
    }
  }

  // Obter usuários conectados
  getConnectedUsers() {
    return socketManager.getConnectedUsers();
  }
}

module.exports = new NotificationService();