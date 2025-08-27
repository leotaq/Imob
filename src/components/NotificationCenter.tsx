import React from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useSocket } from '../hooks/useSocket';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const NotificationCenter: React.FC = () => {
  const { notifications, clearNotifications, isConnected } = useSocket();
  const unreadCount = notifications.length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'solicitacao_created':
        return '📝';
      case 'status_changed':
        return '🔄';
      case 'new_orcamento':
        return '💰';
      case 'orcamento_approved':
        return '✅';
      case 'orcamento_rejected':
        return '❌';
      case 'execucao_started':
        return '🚀';
      case 'execucao_completed':
        return '🎉';
      case 'payment_received':
        return '💳';
      default:
        return '🔔';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          {/* Indicador de conexão */}
          <div 
            className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className="h-6 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>
            <div className="text-center py-4 text-muted-foreground">
              Nenhuma notificação
            </div>
          </DropdownMenuItem>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 10).map((notification, index) => (
              <DropdownMenuItem key={index} className="flex-col items-start p-3">
                <div className="flex items-start w-full">
                  <span className="text-lg mr-2 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.timestamp), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            
            {notifications.length > 10 && (
              <DropdownMenuItem disabled className="text-center text-xs text-muted-foreground">
                +{notifications.length - 10} notificações mais antigas
              </DropdownMenuItem>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};