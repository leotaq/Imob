import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { mockSolicitacoes, mockOrcamentos } from '@/data/mockData';
import { Search, Play, Pause, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Solicitacao } from '@/types';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'aberta': return 'warning';
    case 'andamento': return 'primary';
    case 'concluida': return 'success';
    default: return 'secondary';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'aberta': return 'Aguardando';
    case 'andamento': return 'Em Andamento';
    case 'concluida': return 'Concluída';
    default: return status;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'aberta': return Clock;
    case 'andamento': return Play;
    case 'concluida': return CheckCircle;
    default: return AlertTriangle;
  }
};

const Execucao = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtra apenas solicitações que estão em execução ou aprovadas
  const execucoes = mockSolicitacoes.filter(s => 
    s.status === 'aprovada' || s.status === 'execucao' || s.status === 'concluida'
  );

  const filteredExecucoes = execucoes.filter(
    (solicitacao) =>
      solicitacao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.tipoManutencao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.endereco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOrcamentoPrincipal = (solicitacaoId: string) => {
    return mockOrcamentos.find(o => o.solicitacaoId === solicitacaoId && o.isPrincipal);
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'aprovada': return 25;
      case 'execucao': return 75;
      case 'concluida': return 100;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Execução</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o andamento das manutenções
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aguardando Início
            </CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {execucoes.filter(e => e.status === 'aprovada').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Andamento
            </CardTitle>
            <Play className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {execucoes.filter(e => e.status === 'execucao').length}
            </div>
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
            <div className="text-2xl font-bold text-success">
              {execucoes.filter(e => e.status === 'concluida').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, tipo ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Execuções List */}
      <div className="space-y-4">
        {filteredExecucoes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhuma execução encontrada.</p>
            </CardContent>
          </Card>
        ) : (
          filteredExecucoes.map((solicitacao) => {
            const orcamento = getOrcamentoPrincipal(solicitacao.id);
            const StatusIcon = getStatusIcon(solicitacao.status);
            const progress = getProgressPercentage(solicitacao.status);

            return (
              <Card key={solicitacao.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-3">
                        <StatusIcon className="h-5 w-5" />
                        {solicitacao.tipoManutencao}
                        <Badge variant={getStatusColor(solicitacao.status) as any}>
                          {getStatusLabel(solicitacao.status)}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        ID: {solicitacao.imovelId} • {solicitacao.endereco}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {solicitacao.status === 'aprovada' && (
                        <Button size="sm" className="gap-2">
                          <Play className="h-3 w-3" />
                          Iniciar
                        </Button>
                      )}
                      {solicitacao.status === 'execucao' && (
                        <Button size="sm" variant="outline" className="gap-2">
                          <CheckCircle className="h-3 w-3" />
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">Progresso</span>
                      <span className="text-sm text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Solicitante</p>
                      <p className="text-sm text-muted-foreground">{solicitacao.nome}</p>
                      <p className="text-xs text-muted-foreground">{solicitacao.telefone}</p>
                    </div>
                    {orcamento && (
                      <div>
                        <p className="text-sm font-medium text-foreground">Prestador</p>
                        <p className="text-sm text-muted-foreground">{orcamento.prestador.nome}</p>
                        <p className="text-xs text-muted-foreground">{orcamento.prestador.contato}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">Prazo Final</p>
                      <p className="text-sm text-muted-foreground">
                        {solicitacao.prazoFinal.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {orcamento && (
                      <div>
                        <p className="text-sm font-medium text-foreground">Valor Total</p>
                        <p className="text-sm font-bold text-primary">
                          R$ {orcamento.total.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>

                  {solicitacao.descricao && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm text-foreground">{solicitacao.descricao}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Execucao;