import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, Edit, Trash2, Calendar, MapPin, User, Phone, 
  Clock, AlertTriangle, CheckCircle, XCircle 
} from 'lucide-react';
import { Solicitacao } from '@/types';

interface SolicitacaoCardProps {
  solicitacao: Solicitacao;
  onView: (solicitacao: Solicitacao) => void;
  onEdit: (solicitacao: Solicitacao) => void;
  onDelete: (solicitacao: Solicitacao) => void;
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'aberta': return <AlertTriangle className="h-3 w-3" />;
    case 'orcamento': return <Clock className="h-3 w-3" />;
    case 'aprovada': return <CheckCircle className="h-3 w-3" />;
    case 'execucao': return <Clock className="h-3 w-3" />;
    case 'concluida': return <CheckCircle className="h-3 w-3" />;
    case 'cancelada': return <XCircle className="h-3 w-3" />;
    default: return <Clock className="h-3 w-3" />;
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

const getTipoSolicitanteLabel = (tipo: string) => {
  switch (tipo) {
    case 'inquilino': return 'Inquilino';
    case 'proprietario': return 'Proprietário';
    case 'imobiliaria': return 'Imobiliária';
    case 'terceiros': return 'Terceiros';
    default: return tipo;
  }
};

const SolicitacaoCard: React.FC<SolicitacaoCardProps> = ({
  solicitacao,
  onView,
  onEdit,
  onDelete
}) => {
  const isUrgent = new Date(solicitacao.prazoFinal) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const isOverdue = new Date(solicitacao.prazoFinal) < new Date() && solicitacao.status !== 'concluida';

  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${
      isOverdue ? 'border-red-200 bg-red-50/50' : 
      isUrgent ? 'border-yellow-200 bg-yellow-50/50' : ''
    }`}>
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm text-foreground">
                {solicitacao.tipoManutencao}
              </h3>
              <Badge 
                variant={getStatusColor(solicitacao.status) as any}
                className="flex items-center gap-1 text-xs px-1.5 py-0.5"
              >
                {getStatusIcon(solicitacao.status)}
                {getStatusLabel(solicitacao.status)}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  Atrasada
                </Badge>
              )}
              {isUrgent && !isOverdue && (
                <Badge variant="warning" className="text-xs px-1.5 py-0.5">
                  Urgente
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {solicitacao.imovelId}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {getTipoSolicitanteLabel(solicitacao.tipoSolicitante)}
              </span>
            </div>
          </div>
          <div className="flex gap-0.5">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onView(solicitacao)}>
              <Eye className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(solicitacao)}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onDelete(solicitacao)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-3 pb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
          <div>
            <p className="text-xs font-medium text-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              Solicitante
            </p>
            <p className="text-xs text-muted-foreground">{solicitacao.nome}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {solicitacao.telefone}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Endereço
            </p>
            <p className="text-xs text-muted-foreground">{solicitacao.endereco}</p>
            <p className="text-xs text-muted-foreground">{solicitacao.cidade}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Prazos
            </p>
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
        </div>
        {solicitacao.descricao && (
          <div className="p-1.5 bg-muted/50 rounded">
            <p className="text-xs text-foreground line-clamp-1">
              {solicitacao.descricao}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SolicitacaoCard;