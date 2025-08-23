import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockSolicitacoes, mockOrcamentos } from '@/data/mockData';
import {
  ClipboardList,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

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

const Dashboard = () => {
  const totalSolicitacoes = mockSolicitacoes.length;
  const abertas = mockSolicitacoes.filter(s => s.status === 'aberta').length;
  const emAndamento = mockSolicitacoes.filter(s => s.status === 'execucao').length;
  const concluidas = mockSolicitacoes.filter(s => s.status === 'concluida').length;
  const totalOrcamentos = mockOrcamentos.reduce((acc, orc) => acc + orc.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do sistema de manutenção
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Solicitações
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalSolicitacoes}</div>
            <p className="text-xs text-muted-foreground">
              +2 desde último mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Andamento
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{emAndamento}</div>
            <p className="text-xs text-muted-foreground">
              Requer atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Concluídas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{concluidas}</div>
            <p className="text-xs text-muted-foreground">
              83% taxa de conclusão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {totalOrcamentos.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Orçamentos aprovados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Solicitações Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSolicitacoes
              .filter(s => s.status !== 'concluida')
              .slice(0, 5)
              .map((solicitacao) => (
                <div
                  key={solicitacao.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {solicitacao.tipoManutencao}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {solicitacao.endereco}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(solicitacao.status) as any}>
                    {getStatusLabel(solicitacao.status)}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;