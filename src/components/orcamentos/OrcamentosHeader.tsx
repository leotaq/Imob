import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, FileText, BarChart3, Download, Plus, Calculator } from 'lucide-react';
import { mockSolicitacoes, mockPrestadores } from '@/data/mockData';
import type { Orcamento } from '@/types';

interface OrcamentosHeaderProps {
  viewMode: 'imovel' | 'solicitacao';
  setViewMode: (mode: 'imovel' | 'solicitacao') => void;
  isComparisonMode: boolean;
  setIsComparisonMode: (mode: boolean) => void;
  onExportCSV: () => void;
  onCreateOrcamento: (orcamento: any) => void;
  orcamentos: Orcamento[];
}

export const OrcamentosHeader: React.FC<OrcamentosHeaderProps> = ({
  viewMode,
  setViewMode,
  isComparisonMode,
  setIsComparisonMode,
  onExportCSV,
  onCreateOrcamento,
  orcamentos
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const calculateTotal = () => {
    const subtotal = newOrcamento.maoDeObra + newOrcamento.materiais;
    const taxa = subtotal * (newOrcamento.taxaAdm / 100);
    return subtotal + taxa;
  };

  const handleCreateOrcamento = (e: React.FormEvent) => {
    e.preventDefault();
    const prestador = mockPrestadores.find(p => p.id === newOrcamento.prestadorId);
    if (!prestador) return;

    onCreateOrcamento({
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

  return (
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
        <Button variant="outline" onClick={onExportCSV}>
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
  );
};