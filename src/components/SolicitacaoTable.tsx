import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, ArrowRight, MessageSquare } from 'lucide-react';
import { Solicitacao } from '@/types';

interface SolicitacaoTableProps {
  solicitacoes: Solicitacao[];
  onView: (solicitacao: Solicitacao) => void;
  onEdit: (solicitacao: Solicitacao) => void;
  onDelete: (solicitacao: Solicitacao) => void;
  onViewHistorico: (solicitacao: Solicitacao) => void; // Nova propriedade
  handleStatusChange: (solicitacao: Solicitacao, newStatus: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'aberta': return 'warning';
    case 'orcamento': return 'secondary';
    case 'aprovada': return 'primary';
    case 'execucao': return 'primary';
    case 'concluida': return 'success';
    case 'cancelada': return 'destructive';
    default: return 'secondary';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'aberta': return 'Aberta';
    case 'orcamento': return 'Orçamento';
    case 'aprovada': return 'Aprovada';
    case 'execucao': return 'Em Execução';
    case 'concluida': return 'Concluída';
    case 'cancelada': return 'Cancelada';
    default: return status;
  }
};

const getNextStatusOptions = (currentStatus: string) => {
  switch (currentStatus) {
    case 'aberta':
      return [
        { value: 'orcamento', label: 'Solicitar Orçamento', color: 'secondary' },
        { value: 'cancelada', label: 'Cancelar', color: 'destructive' }
      ];
    case 'orcamento':
      return [
        { value: 'aprovada', label: 'Aprovar', color: 'primary' },
        { value: 'cancelada', label: 'Cancelar', color: 'destructive' }
      ];
    case 'aprovada':
      return [
        { value: 'execucao', label: 'Iniciar Execução', color: 'primary' }
      ];
    case 'execucao':
      return [
        { value: 'concluida', label: 'Concluir', color: 'success' }
      ];
    default:
      return [];
  }
};

const SolicitacaoTable: React.FC<SolicitacaoTableProps> = ({
  solicitacoes,
  onView,
  onEdit,
  onDelete,
  onViewHistorico, // Nova prop
  handleStatusChange
}) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID/Imóvel</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Solicitante</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead>Ações Rápidas</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {solicitacoes.map((solicitacao) => {
            const isOverdue = new Date(solicitacao.prazoFinal) < new Date() && solicitacao.status !== 'concluida';
            const isUrgent = new Date(solicitacao.prazoFinal) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
            const nextStatusOptions = getNextStatusOptions(solicitacao.status);
            
            return (
              <TableRow 
                key={solicitacao.id}
                className={`hover:bg-muted/50 ${
                  isOverdue ? 'bg-red-50/50' : 
                  isUrgent ? 'bg-yellow-50/50' : ''
                }`}
              >
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-mono text-xs">{solicitacao.id}</p>
                    <p className="text-sm font-medium">{solicitacao.imovelId}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{solicitacao.tipoManutencao}</p>
                    {solicitacao.descricao && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {solicitacao.descricao}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{solicitacao.nome}</p>
                    <p className="text-xs text-muted-foreground">{solicitacao.telefone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant={getStatusColor(solicitacao.status) as any} className="w-fit">
                      {getStatusLabel(solicitacao.status)}
                    </Badge>
                    {isOverdue && (
                      <Badge variant="destructive" className="w-fit text-xs">
                        Atrasada
                      </Badge>
                    )}
                    {isUrgent && !isOverdue && (
                      <Badge variant="warning" className="w-fit text-xs">
                        Urgente
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Criada: {solicitacao.dataSolicitacao.toLocaleDateString('pt-BR')}
                    </p>
                    <p className={`text-xs ${
                      isOverdue ? 'text-red-600 font-medium' : 
                      isUrgent ? 'text-yellow-600 font-medium' : 'text-muted-foreground'
                    }`}>
                      Prazo: {solicitacao.prazoFinal.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {nextStatusOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={option.color as any}
                        size="sm"
                        className="h-6 text-xs px-2 flex items-center gap-1"
                        onClick={() => handleStatusChange(solicitacao, option.value)}
                      >
                        <ArrowRight className="h-3 w-3" />
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0" 
                      onClick={() => onView(solicitacao)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0" 
                      onClick={() => onViewHistorico(solicitacao)}
                      title="Ver histórico e comentários"
                    >
                      <MessageSquare className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0" 
                      onClick={() => onEdit(solicitacao)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0" 
                      onClick={() => onDelete(solicitacao)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default SolicitacaoTable;