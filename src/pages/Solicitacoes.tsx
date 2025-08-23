import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockSolicitacoes } from '@/data/mockData';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Solicitacao } from '@/types';

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

const getTipoSolicitanteLabel = (tipo: string) => {
  switch (tipo) {
    case 'inquilino': return 'Inquilino';
    case 'proprietario': return 'Proprietário';
    case 'imobiliaria': return 'Imobiliária';
    case 'terceiros': return 'Terceiros';
    default: return tipo;
  }
};

const Solicitacoes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [solicitacoes] = useState<Solicitacao[]>(mockSolicitacoes);

  const filteredSolicitacoes = solicitacoes.filter(
    (solicitacao) =>
      solicitacao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.tipoManutencao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.endereco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Solicitações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as solicitações de manutenção
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Solicitação
        </Button>
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

      {/* Solicitações List */}
      <div className="space-y-4">
        {filteredSolicitacoes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhuma solicitação encontrada.</p>
            </CardContent>
          </Card>
        ) : (
          filteredSolicitacoes.map((solicitacao) => (
            <Card key={solicitacao.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-3">
                      {solicitacao.tipoManutencao}
                      <Badge variant={getStatusColor(solicitacao.status) as any}>
                        {getStatusLabel(solicitacao.status)}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      ID: {solicitacao.imovelId} • {getTipoSolicitanteLabel(solicitacao.tipoSolicitante)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Solicitante</p>
                    <p className="text-sm text-muted-foreground">{solicitacao.nome}</p>
                    <p className="text-xs text-muted-foreground">{solicitacao.telefone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Endereço</p>
                    <p className="text-sm text-muted-foreground">{solicitacao.endereco}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Data Solicitação</p>
                    <p className="text-sm text-muted-foreground">
                      {solicitacao.dataSolicitacao.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Prazo Final</p>
                    <p className="text-sm text-muted-foreground">
                      {solicitacao.prazoFinal.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                {solicitacao.descricao && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-foreground">{solicitacao.descricao}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Solicitacoes;