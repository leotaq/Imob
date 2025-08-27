import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, Calculator, FileText, Plus, Trash2, 
  DollarSign, Clock, User, MapPin 
} from 'lucide-react';
import { OrcamentoConsolidado, ItemOrcamento, Solicitacao, Prestador } from '@/types';

interface OrcamentoConsolidadoProps {
  imovelId: string;
  solicitacoes: Solicitacao[];
  prestadores: Prestador[];
  onSave: (orcamento: OrcamentoConsolidado) => void;
  onCancel: () => void;
}

const OrcamentoConsolidadoComponent = ({
  imovelId,
  solicitacoes,
  prestadores,
  onSave,
  onCancel
}: OrcamentoConsolidadoProps) => {
  // Estados para gerenciar o orçamento
  const [selectedSolicitacoes, setSelectedSolicitacoes] = useState<string[]>([]);
  const [prestadorSelecionado, setPrestadorSelecionado] = useState<string>('');
  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [taxaAdm, setTaxaAdm] = useState(10);
  const [prazoExecucao, setPrazoExecucao] = useState(7);
  const [observacoes, setObservacoes] = useState('');

  // Informações do imóvel (primeira solicitação como referência)
  const imovelInfo = solicitacoes[0];

  // Cálculos automáticos
  const subtotal = itens.reduce((sum, item) => sum + item.subtotal, 0);
  const valorTaxa = subtotal * (taxaAdm / 100);
  const total = subtotal + valorTaxa;

  // Função para adicionar/remover solicitações
  const toggleSolicitacao = (solicitacaoId: string) => {
    if (selectedSolicitacoes.includes(solicitacaoId)) {
      setSelectedSolicitacoes(prev => prev.filter(id => id !== solicitacaoId));
      setItens(prev => prev.filter(item => item.solicitacaoId !== solicitacaoId));
    } else {
      setSelectedSolicitacoes(prev => [...prev, solicitacaoId]);
      const solicitacao = solicitacoes.find(s => s.id === solicitacaoId);
      if (solicitacao) {
        const novoItem: ItemOrcamento = {
          id: `item-${Date.now()}-${solicitacaoId}`,
          solicitacaoId,
          tipoManutencao: solicitacao.tipoManutencao,
          descricao: solicitacao.descricao,
          maoDeObra: 0,
          materiais: 0,
          subtotal: 0
        };
        setItens(prev => [...prev, novoItem]);
      }
    }
  };

  // Função para atualizar valores de um item
  const updateItem = (itemId: string, field: keyof ItemOrcamento, value: any) => {
    setItens(prev => prev.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        if (field === 'maoDeObra' || field === 'materiais') {
          updated.subtotal = updated.maoDeObra + updated.materiais;
        }
        return updated;
      }
      return item;
    }));
  };

  // Função para salvar o orçamento
  const handleSave = () => {
    if (!prestadorSelecionado || selectedSolicitacoes.length === 0) {
      alert('Selecione um prestador e pelo menos uma solicitação');
      return;
    }

    const prestador = prestadores.find(p => p.id === prestadorSelecionado);
    if (!prestador) return;

    const orcamentoConsolidado: OrcamentoConsolidado = {
      id: `orc-consolidado-${Date.now()}`,
      imovelId,
      solicitacoes: selectedSolicitacoes,
      prestador,
      itens,
      subtotal,
      taxaAdm,
      total,
      prazoExecucao,
      dataOrcamento: new Date(),
      observacoes,
      status: 'rascunho'
    };

    onSave(orcamentoConsolidado);
  };

  return (
    <div className="space-y-6">
      {/* Header com informações do imóvel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Orçamento Consolidado - {imovelId}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {imovelInfo?.endereco}, {imovelInfo?.cidade}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {imovelInfo?.nome} ({imovelInfo?.tipoSolicitante})
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Seleção de Solicitações */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Manutenções</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {solicitacoes.map((solicitacao) => (
            <div key={solicitacao.id} className="flex items-center space-x-3 p-3 border rounded-lg">
              <Checkbox
                checked={selectedSolicitacoes.includes(solicitacao.id)}
                onCheckedChange={() => toggleSolicitacao(solicitacao.id)}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{solicitacao.tipoManutencao}</Badge>
                  <span className="font-medium">{solicitacao.descricao}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Prazo: {solicitacao.prazoFinal.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Seleção de Prestador */}
      <Card>
        <CardHeader>
          <CardTitle>Prestador</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={prestadorSelecionado}
            onChange={(e) => setPrestadorSelecionado(e.target.value)}
          >
            <option value="">Selecione um prestador</option>
            {prestadores.map((prestador) => (
              <option key={prestador.id} value={prestador.id}>
                {prestador.nome} - {prestador.contato}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Detalhamento dos Itens */}
      {itens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Detalhamento dos Serviços
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {itens.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge>{item.tipoManutencao}</Badge>
                  <span className="font-medium">R$ {item.subtotal.toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.descricao}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Mão de Obra</label>
                    <Input
                      type="number"
                      value={item.maoDeObra}
                      onChange={(e) => updateItem(item.id, 'maoDeObra', Number(e.target.value))}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Materiais</label>
                    <Input
                      type="number"
                      value={item.materiais}
                      onChange={(e) => updateItem(item.id, 'materiais', Number(e.target.value))}
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Orçamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Taxa Administrativa (%)</label>
              <Input
                type="number"
                value={taxaAdm}
                onChange={(e) => setTaxaAdm(Number(e.target.value))}
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prazo de Execução (dias)</label>
              <Input
                type="number"
                value={prazoExecucao}
                onChange={(e) => setPrazoExecucao(Number(e.target.value))}
                min="1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      {itens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal dos Serviços:</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa Administrativa ({taxaAdm}%):</span>
              <span>R$ {valorTaxa.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total Geral:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Valor por dia:</span>
              <span>R$ {(total / prazoExecucao).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={selectedSolicitacoes.length === 0}>
          <FileText className="h-4 w-4 mr-2" />
          Salvar Orçamento Consolidado
        </Button>
      </div>
    </div>
  );
};

// Alterado de:
// export default OrcamentoConsolidadoComponent;

// Para:
export { OrcamentoConsolidadoComponent as OrcamentoConsolidado };