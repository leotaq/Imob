import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockOrcamentos, mockSolicitacoes, mockPrestadores } from '@/data/mockData';
import { Plus, Search, Eye, Edit, Trash2, DollarSign, Calendar, CheckCircle, Star, Filter } from 'lucide-react';
import { Orcamento } from '@/types';

const Orcamentos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSolicitacaoId, setSelectedSolicitacaoId] = useState('all');
  const [orcamentos] = useState<Orcamento[]>(mockOrcamentos);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filtra orçamentos conforme filtro e busca
  const filteredOrcamentos = orcamentos.filter((orcamento) => {
    if (selectedSolicitacaoId !== 'all' && orcamento.solicitacaoId !== selectedSolicitacaoId) {
      return false;
    }
    if (!searchTerm) return true;
    return (
      orcamento.prestador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSolicitacaoInfo(orcamento.solicitacaoId)?.tipoManutencao.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Agrupa orçamentos por solicitação
  const groupedOrcamentos = filteredOrcamentos.reduce((acc, orcamento) => {
    const solicitacaoId = orcamento.solicitacaoId;
    if (!acc[solicitacaoId]) acc[solicitacaoId] = [];
    acc[solicitacaoId].push(orcamento);
    return acc;
  }, {} as Record<string, Orcamento[]>);

  const selectedSolicitacao = selectedSolicitacaoId !== 'all'
    ? getSolicitacaoInfo(selectedSolicitacaoId)
    : null;

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" overlayTransparent={true}>
            <DialogHeader>
              <DialogTitle>Novo Orçamento</DialogTitle>
            </DialogHeader>
            {/* Formulário básico de orçamento */}
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Solicitação</label>
                <select className="w-full border rounded px-2 py-1">
                  {mockSolicitacoes.map((s) => (
                    <option key={s.id} value={s.id}>
                      Imóvel: {s.imovelId} • {s.tipoManutencao}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prestador</label>
                <select className="w-full border rounded px-2 py-1">
                  {mockPrestadores.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Mão de Obra (R$)</label>
                  <input type="number" className="w-full border rounded px-2 py-1" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Materiais (R$)</label>
                  <input type="number" className="w-full border rounded px-2 py-1" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Taxa Adm (%)</label>
                  <input type="number" className="w-full border rounded px-2 py-1" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Prazo Execução (dias)</label>
                  <input type="number" className="w-full border rounded px-2 py-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data do Orçamento</label>
                <input type="date" className="w-full border rounded px-2 py-1" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="principal" />
                <label htmlFor="principal" className="text-sm">Marcar como principal</label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Select value={selectedSolicitacaoId} onValueChange={setSelectedSolicitacaoId}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Selecione uma solicitação para filtrar..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as solicitações</SelectItem>
              {mockSolicitacoes.map((solicitacao) => (
                <SelectItem key={solicitacao.id} value={solicitacao.id}>
                  Imóvel: {solicitacao.imovelId} • {solicitacao.tipoManutencao} • {solicitacao.endereco}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por prestador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={selectedSolicitacaoId === 'all'}
          />
        </div>
      </div>

      {/* Selected Solicitation Info */}
      {selectedSolicitacao && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{selectedSolicitacao.tipoManutencao}</h3>
                <p className="text-sm text-muted-foreground">
                  Imóvel: {selectedSolicitacao.imovelId} • {selectedSolicitacao.endereco}
                </p>
              </div>
              <Badge variant="secondary">
                {orcamentos.filter(o => o.solicitacaoId === selectedSolicitacaoId).length} orçamento(s)
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Orçamentos agrupados por solicitação */}
      <div className="space-y-8">
        {Object.keys(groupedOrcamentos).length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhum orçamento encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedOrcamentos).map(([solicitacaoId, orcamentos]) => {
            const solicitacao = getSolicitacaoInfo(solicitacaoId);
            return (
              <div key={solicitacaoId} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">
                    Imóvel: {solicitacao?.imovelId} • {solicitacao?.tipoManutencao} • {solicitacao?.endereco}
                  </h2>
                  <Badge variant="secondary">{orcamentos.length} orçamento(s)</Badge>
                </div>
                <div className="space-y-4">
                  {orcamentos.map((orcamento) => (
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
                              Prestador: {orcamento.prestador.nome} • Imóvel: {solicitacao?.imovelId}
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
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Orcamentos;