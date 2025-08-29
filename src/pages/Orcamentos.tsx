import React, { useState } from 'react';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { mockSolicitacoes, mockPrestadores } from '@/data/mockData';
import { 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  FileText, 
  Calculator, 
  Clock,
  User,
  Building2,
  CheckCircle,
  XCircle,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Solicitacao, Prestador } from '@/types';

interface ItemMaterial {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface ItemServico {
  id: string;
  descricao: string;
  valorMaoDeObra: number;
  tempoEstimado: number; // em horas
}

interface NovoOrcamento {
  solicitacaoId: string;
  materiais: ItemMaterial[];
  servicos: ItemServico[];
  dataVisita?: Date;
  observacoes: string;
  prazoExecucao: number;
  taxaAdm: number;
}

const Orcamentos = () => {
  const { orcamentos, createOrcamento } = useOrcamentos();
  const { usuario } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [novoOrcamento, setNovoOrcamento] = useState<NovoOrcamento>({
    solicitacaoId: '',
    materiais: [],
    servicos: [],
    observacoes: '',
    prazoExecucao: 7,
    taxaAdm: 10
  });
  const [activeTab, setActiveTab] = useState('solicitacoes');

  // Função para adicionar material
  const adicionarMaterial = () => {
    const novoMaterial: ItemMaterial = {
      id: Date.now().toString(),
      descricao: '',
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0
    };
    setNovoOrcamento(prev => ({
      ...prev,
      materiais: [...prev.materiais, novoMaterial]
    }));
  };

  // Função para remover material
  const removerMaterial = (id: string) => {
    setNovoOrcamento(prev => ({
      ...prev,
      materiais: prev.materiais.filter(m => m.id !== id)
    }));
  };

  // Função para atualizar material
  const atualizarMaterial = (id: string, campo: keyof ItemMaterial, valor: any) => {
    setNovoOrcamento(prev => ({
      ...prev,
      materiais: prev.materiais.map(m => {
        if (m.id === id) {
          const materialAtualizado = { ...m, [campo]: valor };
          if (campo === 'quantidade' || campo === 'valorUnitario') {
            materialAtualizado.valorTotal = materialAtualizado.quantidade * materialAtualizado.valorUnitario;
          }
          return materialAtualizado;
        }
        return m;
      })
    }));
  };

  // Função para adicionar serviço
  const adicionarServico = () => {
    const novoServico: ItemServico = {
      id: Date.now().toString(),
      descricao: '',
      valorMaoDeObra: 0,
      tempoEstimado: 1
    };
    setNovoOrcamento(prev => ({
      ...prev,
      servicos: [...prev.servicos, novoServico]
    }));
  };

  // Função para remover serviço
  const removerServico = (id: string) => {
    setNovoOrcamento(prev => ({
      ...prev,
      servicos: prev.servicos.filter(s => s.id !== id)
    }));
  };

  // Função para atualizar serviço
  const atualizarServico = (id: string, campo: keyof ItemServico, valor: any) => {
    setNovoOrcamento(prev => ({
      ...prev,
      servicos: prev.servicos.map(s => 
        s.id === id ? { ...s, [campo]: valor } : s
      )
    }));
  };

  // Calcular totais
  const calcularTotais = () => {
    const totalMateriais = novoOrcamento.materiais.reduce((acc, m) => acc + m.valorTotal, 0);
    const totalServicos = novoOrcamento.servicos.reduce((acc, s) => acc + s.valorMaoDeObra, 0);
    const subtotal = totalMateriais + totalServicos;
    const valorTaxaAdm = subtotal * (novoOrcamento.taxaAdm / 100);
    const total = subtotal + valorTaxaAdm;
    
    return {
      totalMateriais,
      totalServicos,
      subtotal,
      valorTaxaAdm,
      total
    };
  };

  // Função para abrir dialog de novo orçamento
  const abrirNovoOrcamento = (solicitacao: Solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setNovoOrcamento(prev => ({
      ...prev,
      solicitacaoId: solicitacao.id,
      materiais: [],
      servicos: [],
      observacoes: '',
      dataVisita: undefined
    }));
    setIsDialogOpen(true);
  };

  // Função para salvar orçamento
  const salvarOrcamento = () => {
    if (!selectedSolicitacao || !usuario) return;
    
    const totais = calcularTotais();
    const prestador = mockPrestadores.find(p => p.id === usuario.id) || mockPrestadores[0];
    
    createOrcamento({
      solicitacaoId: novoOrcamento.solicitacaoId,
      prestadorId: prestador.id,
      itensServico: [],
      taxaAdm: novoOrcamento.taxaAdm,
      prazoExecucao: novoOrcamento.prazoExecucao,
      subtotalMateriais: totais.totalMateriais,
      subtotalMaoDeObra: totais.totalServicos,
      subtotal: totais.totalMateriais + totais.totalServicos,
      valorTaxaAdm: (totais.totalMateriais + totais.totalServicos) * (novoOrcamento.taxaAdm / 100),
      total: totais.total,
      status: 'rascunho',
      dataOrcamento: new Date()
    });
    
    setIsDialogOpen(false);
    setSelectedSolicitacao(null);
  };

  // Filtrar solicitações que ainda não têm orçamento do usuário atual
  const solicitacoesDisponiveis = mockSolicitacoes.filter(sol => 
    !orcamentos.some(orc => orc.solicitacaoId === sol.id && orc.prestadorId === usuario?.id)
  );

  const totais = calcularTotais();

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-muted-foreground mt-1">
            {usuario?.tipo === 'prestador' 
              ? 'Crie orçamentos detalhados para as solicitações'
              : 'Gerencie e analise orçamentos recebidos'
            }
          </p>
        </div>
      </div>

      {/* Navegação por Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="solicitacoes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Solicitações Disponíveis
          </TabsTrigger>
          <TabsTrigger value="meus-orcamentos" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Meus Orçamentos
          </TabsTrigger>
        </TabsList>

        {/* Tab de Solicitações Disponíveis */}
        <TabsContent value="solicitacoes" className="space-y-4">
          <div className="grid gap-4">
            {solicitacoesDisponiveis.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Nenhuma solicitação disponível para orçamento.</p>
                </CardContent>
              </Card>
            ) : (
              solicitacoesDisponiveis.map((solicitacao) => (
                <Card key={solicitacao.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Solicitação #{solicitacao.id.slice(-6)}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {solicitacao.servicos.length} serviço(s) solicitado(s)
                        </p>
                      </div>
                      <Badge variant="outline">
                        {solicitacao.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm">{solicitacao.observacoesGerais || 'Sem observações'}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Solicitante
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Prazo: {solicitacao.prazoDesejado ? format(new Date(solicitacao.prazoDesejado), 'dd/MM/yyyy', { locale: ptBR }) : 'Não definido'}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={() => abrirNovoOrcamento(solicitacao)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Orçamento
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Tab de Meus Orçamentos */}
        <TabsContent value="meus-orcamentos" className="space-y-4">
          <div className="grid gap-4">
            {orcamentos.filter(orc => orc.prestadorId === usuario?.id).length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Você ainda não criou nenhum orçamento.</p>
                </CardContent>
              </Card>
            ) : (
              orcamentos
                .filter(orc => orc.prestadorId === usuario?.id)
                .map((orcamento) => {
                  const solicitacao = mockSolicitacoes.find(s => s.id === orcamento.solicitacaoId);
                  return (
                    <Card key={orcamento.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              Solicitação #{solicitacao?.id.slice(-6) || 'N/A'}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {solicitacao?.servicos.length || 0} serviço(s) solicitado(s)
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={orcamento.isPrincipal ? 'default' : 'secondary'}>
                              {orcamento.isPrincipal ? 'Aprovado' : 'Pendente'}
                            </Badge>
                            {orcamento.isPrincipal ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-yellow-500" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Materiais</p>
                            <p className="font-semibold">R$ {orcamento.materiais.toLocaleString('pt-BR')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Mão de Obra</p>
                            <p className="font-semibold">R$ {orcamento.maoDeObra.toLocaleString('pt-BR')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Prazo</p>
                            <p className="font-semibold">{orcamento.prazoExecucao} dias</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-bold text-lg">R$ {orcamento.total.toLocaleString('pt-BR')}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para Criar Novo Orçamento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Novo Orçamento - {selectedSolicitacao?.tipoManutencao}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Informações da Solicitação */}
            {selectedSolicitacao && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalhes da Solicitação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Endereço</p>
                      <p>{selectedSolicitacao.endereco}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Solicitante</p>
                      <p>{selectedSolicitacao.nome}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Descrição</p>
                      <p>{selectedSolicitacao.descricao}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seção de Materiais */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Materiais</CardTitle>
                  <Button onClick={adicionarMaterial} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Material
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {novoOrcamento.materiais.map((material) => (
                    <div key={material.id} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        <Label>Descrição</Label>
                        <Input
                          value={material.descricao}
                          onChange={(e) => atualizarMaterial(material.id, 'descricao', e.target.value)}
                          placeholder="Ex: Tinta acrílica branca"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Quantidade</Label>
                        <Input
                          type="number"
                          value={material.quantidade}
                          onChange={(e) => atualizarMaterial(material.id, 'quantidade', Number(e.target.value))}
                          min="1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Valor Unitário</Label>
                        <Input
                          type="number"
                          value={material.valorUnitario}
                          onChange={(e) => atualizarMaterial(material.id, 'valorUnitario', Number(e.target.value))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-3">
                        <Label>Total</Label>
                        <Input
                          value={`R$ ${material.valorTotal.toLocaleString('pt-BR')}`}
                          disabled
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removerMaterial(material.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {novoOrcamento.materiais.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum material adicionado. Clique em "Adicionar Material" para começar.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Seção de Serviços */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Serviços</CardTitle>
                  <Button onClick={adicionarServico} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Serviço
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {novoOrcamento.servicos.map((servico) => (
                    <div key={servico.id} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-6">
                        <Label>Descrição do Serviço</Label>
                        <Input
                          value={servico.descricao}
                          onChange={(e) => atualizarServico(servico.id, 'descricao', e.target.value)}
                          placeholder="Ex: Pintura de parede"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Tempo (horas)</Label>
                        <Input
                          type="number"
                          value={servico.tempoEstimado}
                          onChange={(e) => atualizarServico(servico.id, 'tempoEstimado', Number(e.target.value))}
                          min="1"
                        />
                      </div>
                      <div className="col-span-3">
                        <Label>Valor Mão de Obra</Label>
                        <Input
                          type="number"
                          value={servico.valorMaoDeObra}
                          onChange={(e) => atualizarServico(servico.id, 'valorMaoDeObra', Number(e.target.value))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removerServico(servico.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {novoOrcamento.servicos.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum serviço adicionado. Clique em "Adicionar Serviço" para começar.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Seção de Agendamento e Configurações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Agendamento de Visita */}
              <Card>
                <CardHeader>
                  <CardTitle>Agendamento de Visita</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Data da Visita (Opcional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {novoOrcamento.dataVisita ? (
                            format(novoOrcamento.dataVisita, 'dd/MM/yyyy', { locale: ptBR })
                          ) : (
                            <span>Selecionar data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={novoOrcamento.dataVisita}
                          onSelect={(date) => setNovoOrcamento(prev => ({ ...prev, dataVisita: date }))}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>

              {/* Configurações do Orçamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Prazo de Execução (dias)</Label>
                    <Input
                      type="number"
                      value={novoOrcamento.prazoExecucao}
                      onChange={(e) => setNovoOrcamento(prev => ({ ...prev, prazoExecucao: Number(e.target.value) }))}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label>Taxa Administrativa (%)</Label>
                    <Input
                      type="number"
                      value={novoOrcamento.taxaAdm}
                      onChange={(e) => setNovoOrcamento(prev => ({ ...prev, taxaAdm: Number(e.target.value) }))}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={novoOrcamento.observacoes}
                  onChange={(e) => setNovoOrcamento(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Adicione observações importantes sobre o orçamento..."
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Resumo Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Materiais:</span>
                    <span>R$ {totais.totalMateriais.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Serviços:</span>
                    <span>R$ {totais.totalServicos.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {totais.subtotal.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa Administrativa ({novoOrcamento.taxaAdm}%):</span>
                    <span>R$ {totais.valorTaxaAdm.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total Geral:</span>
                    <span>R$ {totais.total.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={salvarOrcamento}>
                Salvar Orçamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orcamentos;