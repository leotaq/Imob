import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, Edit, Trash2, Calendar, DollarSign, Clock, 
  Star, CheckCircle, TrendingDown, TrendingUp, Award
} from 'lucide-react';
import { Orcamento } from '@/types';
import { mockSolicitacoes } from '@/data/mockData';

interface OrcamentoCardProps {
  orcamento: Orcamento;
  solicitacao?: any;
  isLowestPrice?: boolean;
  isFastestDelivery?: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePrincipal: (id: string) => void;
  onApprove?: (id: string) => void;
}

const OrcamentoCard: React.FC<OrcamentoCardProps> = ({
  orcamento,
  solicitacao,
  isLowestPrice = false,
  isFastestDelivery = false,
  onView,
  onEdit,
  onDelete,
  onTogglePrincipal,
  onApprove
}) => {
  
  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${
      orcamento.isPrincipal ? 'border-green-200 bg-green-50/50' : ''
    } ${
      isLowestPrice ? 'border-blue-200 bg-blue-50/50' : ''
    }`}>
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm text-foreground">
                {orcamento.prestador.nome}
              </h3>
              
              {orcamento.isPrincipal && (
                <Badge variant="default" className="flex items-center gap-1 text-xs px-1.5 py-0.5">
                  <Star className="h-3 w-3" />
                  Principal
                </Badge>
              )}
              
              {isLowestPrice && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs px-1.5 py-0.5">
                  <TrendingDown className="h-3 w-3" />
                  Menor Preço
                </Badge>
              )}
              
              {isFastestDelivery && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs px-1.5 py-0.5">
                  <Clock className="h-3 w-3" />
                  Mais Rápido
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>ID: {orcamento.id}</span>
              <span>•</span>
              <span>{solicitacao?.tipoManutencao}</span>
            </div>
          </div>
          
          <div className="flex gap-0.5">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onView(orcamento.id)}>
              <Eye className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(orcamento.id)}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onDelete(orcamento.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-3 pb-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
          <div>
            <p className="text-xs font-medium text-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Total
            </p>
            <p className="text-sm font-bold text-primary">
              R$ {orcamento.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div>
            <p className="text-xs font-medium text-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Prazo
            </p>
            <p className="text-xs text-muted-foreground">
              {orcamento.prazoExecucao} dias
            </p>
          </div>
          
          <div>
            <p className="text-xs font-medium text-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Data
            </p>
            <p className="text-xs text-muted-foreground">
              {orcamento.dataOrcamento.toLocaleDateString('pt-BR')}
            </p>
          </div>
          
          <div>
            <p className="text-xs font-medium text-foreground">Contato</p>
            <p className="text-xs text-muted-foreground">
              {orcamento.prestador.contato}
            </p>
          </div>
        </div>
        
        {/* Detalhes dos valores */}
        <div className="p-1.5 bg-muted/50 rounded text-xs">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-muted-foreground">M.O.:</span>
              <span className="ml-1 font-medium">
                R$ {orcamento.maoDeObra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Mat.:</span>
              <span className="ml-1 font-medium">
                R$ {orcamento.materiais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Taxa:</span>
              <span className="ml-1 font-medium">{orcamento.taxaAdm}%</span>
            </div>
          </div>
        </div>
        
        {/* Botão para marcar como principal */}
        {!orcamento.isPrincipal && (
          <div className="mt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full h-7 text-xs gap-1"
              onClick={() => onTogglePrincipal(orcamento.id)}
            >
              <CheckCircle className="h-3 w-3" />
              Escolher como Principal
            </Button>
          </div>
        )}
        
        {/* Botão de aprovação */}
        {onApprove && (
          <div className="mt-1">
            <Button 
              size="sm" 
              className="w-full h-7 text-xs gap-1 bg-green-600 hover:bg-green-700"
              onClick={() => onApprove(orcamento.id)}
            >
              <CheckCircle className="h-3 w-3" />
              Aprovar Orçamento
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrcamentoCard;