import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockOrcamentos, mockSolicitacoes } from '@/data/mockData';
import { Plus, Search, Eye, Edit, Trash2, DollarSign, Calendar, CheckCircle, Star } from 'lucide-react';
import { Orcamento } from '@/types';

const Orcamentos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orcamentos] = useState<Orcamento[]>(mockOrcamentos);

  const filteredOrcamentos = orcamentos.filter(
    (orcamento) =>
      orcamento.prestador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSolicitacaoInfo(orcamento.solicitacaoId)?.tipoManutencao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function getSolicitacaoInfo(solicitacaoId: string) {
    return mockSolicitacoes.find(s => s.id === solicitacaoId);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os orçamentos das solicitações
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por prestador ou tipo de manutenção..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Orçamentos List */}
      <div className="space-y-4">
        {filteredOrcamentos.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhum orçamento encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrcamentos.map((orcamento) => {
            const solicitacao = getSolicitacaoInfo(orcamento.solicitacaoId);
            return (
              <Card key={orcamento.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-3">
                        {solicitacao?.tipoManutencao}
                        {orcamento.isPrincipal && (
                          <Badge variant="success" className="gap-1">
                            <Star className="h-3 w-3" />
                            Principal
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Prestador: {orcamento.prestador.nome} • ID: {solicitacao?.imovelId}
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
                      <p className="text-sm font-medium text-foreground">Valores</p>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Mão de obra: R$ {orcamento.maoDeObra.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Materiais: R$ {orcamento.materiais.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Taxa adm ({orcamento.taxaAdm}%): R$ {((orcamento.maoDeObra + orcamento.materiais) * (orcamento.taxaAdm / 100)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Total</p>
                      <p className="text-lg font-bold text-primary">
                        R$ {orcamento.total.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Prazo</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {orcamento.prazoExecucao} dias
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Data Orçamento</p>
                      <p className="text-sm text-muted-foreground">
                        {orcamento.dataOrcamento.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Contato: {orcamento.prestador.contato}
                        </span>
                      </div>
                      {!orcamento.isPrincipal && (
                        <Button size="sm" variant="outline" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Escolher Principal
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Orcamentos;