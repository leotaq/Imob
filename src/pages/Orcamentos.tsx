import React, { useState } from 'react';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { useImovelGrouping } from '@/hooks/useImovelGrouping';
import { ImovelCard } from '@/components/orcamentos/ImovelCard';
import { OrcamentoConsolidado } from '@/components/OrcamentoConsolidado';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, FileText, BarChart3, Download, Plus, Calculator } from 'lucide-react';
import { mockSolicitacoes, mockPrestadores } from '@/data/mockData';
import type { OrcamentoConsolidado as OrcamentoConsolidadoType } from '@/types';

const Orcamentos = () => {
  const { orcamentos, createOrcamento, updateOrcamento, statistics } = useOrcamentos();
  const { imoveisAgrupados } = useImovelGrouping();
  
  const [viewMode, setViewMode] = useState<'imovel' | 'solicitacao'>('imovel');
  const [isConsolidadoDialogOpen, setIsConsolidadoDialogOpen] = useState(false);
  const [selectedImovelId, setSelectedImovelId] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [newOrcamento, setNewOrcamento] = useState({
    solicitacaoId: '',
    prestadorId: '',
    maoDeObra: 0,
    materiais: 0,
    taxaAdm: 10,
    prazoExecucao: 7,
    dataOrcamento: new Date().toISOString().split('T')[0],
    observacoes: '',
    isPrincipal: false
  });

  // Funções auxiliares
  const handleSaveOrcamentoConsolidado = (orcamentoConsolidado: OrcamentoConsolidadoType) => {
    orcamentoConsolidado.itens.forEach(item => {
      const prestador = orcamentoConsolidado.prestador;
      createOrcamento({
        solicitacaoId: item.solicitacaoId,
        prestador,
        maoDeObra: item.maoDeObra,
        materiais: item.materiais,
        taxaAdm: orcamentoConsolidado.taxaAdm,
        prazoExecucao: orcamentoConsolidado.prazoExecucao,
        total: item.subtotal + (item.subtotal * (orcamentoConsolidado.taxaAdm / 100)),
        isPrincipal: true,
        dataOrcamento: orcamentoConsolidado.dataOrcamento
      });
    });
    
    setIsConsolidadoDialogOpen(false);
    setSelectedImovelId('');
  };

  const openConsolidadoDialog = (imovelId: string) => {
    setSelectedImovelId(imovelId);
    setIsConsolidadoDialogOpen(true);
  };

  const calculateTotal = () => {
    const subtotal = newOrcamento.maoDeObra + newOrcamento.materiais;
    const taxa = subtotal * (newOrcamento.taxaAdm / 100);
    return subtotal + taxa;
  };

  const handleCreateOrcamento = (e: React.FormEvent) => {
    e.preventDefault();
    const prestador = mockPrestadores.find(p => p.id === newOrcamento.prestadorId);
    if (!prestador) return;

    createOrcamento({
      ...newOrcamento,
      prestador,
      total: calculateTotal(),
      dataOrcamento: new Date(newOrcamento.dataOrcamento)
    });

    setNewOrcamento({
      solicitacaoId: '',
      prestadorId: '',
      maoDeObra: 0,
      materiais: 0,
      taxaAdm: 10,
      prazoExecucao: 7,
      dataOrcamento: new Date().toISOString().split('T')[0],
      isPrincipal: false,
      observacoes: ''
    });
    setIsDialogOpen(false);
  };

  const exportToCSV = () => {
    const csvData = orcamentos.map(orc => ({
      ID: orc.id,
      Solicitacao: orc.solicitacaoId,
      Prestador: orc.prestador.nome,
      'Mao de Obra': orc.maoDeObra,
      Materiais: orc.materiais,
      'Taxa Admin': orc.taxaAdm,
      Total: orc.total,
      Prazo: orc.prazoExecucao,
      Data: orc.dataOrcamento.toLocaleDateString('pt-BR'),
      Principal: orc.isPrincipal ? 'Sim' : 'Não'
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orcamentos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os orçamentos das solicitações
          </p>
        </div>
        <div className="flex gap-2">
          {/* Toggle de Visualização */}
          <div className="flex border rounded-lg p-1 bg-muted">
            <Button
              variant={viewMode === 'solicitacao' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('solicitacao')}
              className="h-8"
            >
              <FileText className="h-4 w-4 mr-1" />
              Por Solicitação
            </Button>
            <Button
              variant={viewMode === 'imovel' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('imovel')}
              className="h-8"
            >
              <Building2 className="h-4 w-4 mr-1" />
              Por Imóvel
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setIsComparisonMode(!isComparisonMode)}
            className={isComparisonMode ? 'bg-blue-50 border-blue-200' : ''}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {isComparisonMode ? 'Sair da Comparação' : 'Comparar'}
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          {/* Dialog para Novo Orçamento */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Novo Orçamento
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateOrcamento} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Solicitação *</label>
                    <select 
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newOrcamento.solicitacaoId}
                      onChange={(e) => setNewOrcamento({...newOrcamento, solicitacaoId: e.target.value})}
                      required
                    >
                      <option value="">Selecione uma solicitação</option>
                      {mockSolicitacoes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.imovelId} • {s.tipoManutencao} • {s.endereco}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Prestador *</label>
                    <select 
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newOrcamento.prestadorId}
                      onChange={(e) => setNewOrcamento({...newOrcamento, prestadorId: e.target.value})}
                      required
                    >
                      <option value="">Selecione um prestador</option>
                      {mockPrestadores.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Mão de Obra (R$) *</label>
                    <input 
                      type="number" 
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newOrcamento.maoDeObra}
                      onChange={(e) => setNewOrcamento({...newOrcamento, maoDeObra: Number(e.target.value)})}
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Materiais (R$) *</label>
                    <input 
                      type="number" 
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newOrcamento.materiais}
                      onChange={(e) => setNewOrcamento({...newOrcamento, materiais: Number(e.target.value)})}
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Taxa Admin (%) *</label>
                    <input 
                      type="number" 
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newOrcamento.taxaAdm}
                      onChange={(e) => setNewOrcamento({...newOrcamento, taxaAdm: Number(e.target.value)})}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Prazo Execução (dias) *</label>
                    <input 
                      type="number" 
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newOrcamento.prazoExecucao}
                      onChange={(e) => setNewOrcamento({...newOrcamento, prazoExecucao: Number(e.target.value)})}
                      min="1"
                      placeholder="7"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Data do Orçamento *</label>
                    <input 
                      type="date" 
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newOrcamento.dataOrcamento}
                      onChange={(e) => setNewOrcamento({...newOrcamento, dataOrcamento: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Observações</label>
                  <textarea 
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    value={newOrcamento.observacoes}
                    onChange={(e) => setNewOrcamento({...newOrcamento, observacoes: e.target.value})}
                    placeholder="Observações adicionais sobre o orçamento..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="principal"
                    checked={newOrcamento.isPrincipal}
                    onCheckedChange={(checked) => setNewOrcamento({...newOrcamento, isPrincipal: !!checked})}
                  />
                  <label htmlFor="principal" className="text-sm font-medium">
                    Marcar como orçamento principal
                  </label>
                </div>

                {/* Calculadora em tempo real */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Cálculo Automático</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Subtotal:</p>
                      <p className="font-bold text-gray-900">
                        R$ {(newOrcamento.maoDeObra + newOrcamento.materiais).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Taxa Admin:</p>
                      <p className="font-bold text-gray-900">
                        R$ {((newOrcamento.maoDeObra + newOrcamento.materiais) * (newOrcamento.taxaAdm / 100)).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Final:</p>
                      <p className="font-bold text-2xl text-blue-600">
                        R$ {calculateTotal().toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Valor/Dia:</p>
                      <p className="font-bold text-gray-900">
                        R$ {newOrcamento.prazoExecucao > 0 ? (calculateTotal() / newOrcamento.prazoExecucao).toFixed(2) : '0,00'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Orçamento
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dashboard de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 border-blue-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-blue-700 font-semibold uppercase tracking-wide">Total de Orçamentos</p>
                <p className="text-3xl font-bold text-blue-900">{statistics.total}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <FileText className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 via-green-100 to-green-200 border-green-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-green-700 font-semibold uppercase tracking-wide">Aprovados</p>
                <p className="text-3xl font-bold text-green-900">{statistics.aprovados}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <BarChart3 className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 border-yellow-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-yellow-700 font-semibold uppercase tracking-wide">Pendentes</p>
                <p className="text-3xl font-bold text-yellow-900">{statistics.pendentes}</p>
              </div>
              <div className="p-3 bg-yellow-200 rounded-full">
                <Building2 className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 border-purple-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-purple-700 font-semibold uppercase tracking-wide">Valor Total</p>
                <p className="text-3xl font-bold text-purple-900">R$ {statistics.valorTotal.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Calculator className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      {viewMode === 'imovel' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Agrupamento por Imóvel</h2>
            <Badge variant="outline">
              {imoveisAgrupados.length} imóveis encontrados
            </Badge>
          </div>
          
          <div className="grid gap-4">
            {imoveisAgrupados.map((imovel) => (
              <ImovelCard 
                key={imovel.imovelId}
                imovel={imovel}
                orcamentos={orcamentos}
                onOpenConsolidado={openConsolidadoDialog}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dialog para Orçamento Consolidado */}
      <Dialog open={isConsolidadoDialogOpen} onOpenChange={setIsConsolidadoDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Orçamento Consolidado</DialogTitle>
          </DialogHeader>
          {selectedImovelId && (
            <OrcamentoConsolidado
              imovelId={selectedImovelId}
              onSave={handleSaveOrcamentoConsolidado}
              onCancel={() => setIsConsolidadoDialogOpen(false)}
              solicitacoes={mockSolicitacoes}
              prestadores={mockPrestadores}
              imovelId={selectedImovelId}
              onSave={handleSaveOrcamentoConsolidado}
              onCancel={() => setIsConsolidadoDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orcamentos;