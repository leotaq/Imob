import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface Notification {
  type: string;
  message: string;
  data?: any;
  timestamp: Date;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  joinSolicitacao: (solicitacaoId: string) => void;
  leaveSolicitacao: (solicitacaoId: string) => void;
  clearNotifications: () => void;
}

export const useSocket = (): UseSocketReturn => {
  const { token, usuario } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!token || !usuario) {
      return;
    }

    // Conectar ao socket
    const socket = io(process.env.VITE_API_URL || 'http://localhost:3001', {
      auth: {
        token
      }
    });

    socketRef.current = socket;

    // Eventos de conexão
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Conectado ao servidor Socket.IO');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Desconectado do servidor Socket.IO');
    });

    socket.on('connect_error', (error) => {
      console.error('Erro de conexão Socket.IO:', error);
      setIsConnected(false);
    });

    // Eventos de notificações
    socket.on('solicitacao_created', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      toast({
        title: 'Nova Solicitação',
        description: notification.message,
      });
    });

    socket.on('solicitacao_status_changed', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      toast({
        title: 'Status Atualizado',
        description: notification.message,
      });
    });

    socket.on('new_orcamento', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      toast({
        title: 'Novo Orçamento',
        description: notification.message,
      });
    });

    socket.on('solicitacao_updated', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    socket.on('orcamento_created', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    socket.on('custom_notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      toast({
        title: 'Notificação',
        description: notification.message,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token, usuario]);

  const joinSolicitacao = (solicitacaoId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_solicitacao', solicitacaoId);
    }
  };

  const leaveSolicitacao = (solicitacaoId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_solicitacao', solicitacaoId);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    socket: socketRef.current,
    isConnected,
    notifications,
    joinSolicitacao,
    leaveSolicitacao,
    clearNotifications
  };
};