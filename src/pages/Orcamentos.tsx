import React, { useState, useMemo } from 'react';
import useOrcamentos from '@/hooks/useOrcamentos';
import { useAuth } from '@/hooks/useAuth';
import { useViewMode } from '@/hooks/useViewMode';
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
  Edit,
  MapPin,
  AlertCircle
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
  const { orcamentos, solicitacoes, prestadores, loading, createOrcamento } = useOrcamentos();
  const { usuario } = useAuth();
  const { viewMode } = useViewMode();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);

  // Função para fechar o dialog e limpar estados
  const fecharDialog = () => {
    setIsDialogOpen(false);
    setSelectedSolicitacao(null);
    setNovoOrcamento({
      solicitacaoId: '',
      materiais: [],
      servicos: [],
      observacoes: '',
      prazoExecucao: 7,
      taxaAdm: 10
    });
  };
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
            const quantidade = isNaN(materialAtualizado.quantidade) ? 0 : materialAtualizado.quantidade;
            const valorUnitario = isNaN(materialAtualizado.valorUnitario) ? 0 : materialAtualizado.valorUnitario;
            materialAtualizado.valorTotal = quantidade * valorUnitario;
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
      servicos: prev.servicos.map(s => {
        if (s.id === id) {
          const servicoAtualizado = { ...s, [campo]: valor };
          if (campo === 'valorMaoDeObra' && isNaN(servicoAtualizado.valorMaoDeObra)) {
            servicoAtualizado.valorMaoDeObra = 0;
          }
          return servicoAtualizado;
        }
        return s;
      })
    }));
  };

  // Calcular totais
  const calcularTotais = () => {
    const totalMateriais = novoOrcamento.materiais.reduce((acc, m) => acc + (m.valorTotal || 0), 0);
    const totalServicos = novoOrcamento.servicos.reduce((acc, s) => acc + (s.valorMaoDeObra || 0), 0);
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
  const salvarOrcamento = async () => {
    if (!selectedSolicitacao || !usuario) return;
    
    // Encontrar o prestador associado ao usuário atual
    const prestadorAtual = prestadores.find(p => p.usuarioId === usuario.id);
    
    // Para usuários master, permitir criação mesmo sem ser prestador
    if (!prestadorAtual && !usuario.isMaster) {
      console.error('Usuário não é um prestador cadastrado');
      return;
    }
    
    // Validar se há pelo menos um serviço
    if (novoOrcamento.servicos.length === 0) {
      console.error('Pelo menos um serviço é obrigatório');
      return;
    }
    
    try {
      const totais = calcularTotais();
      
      // Criar itens de serviço no formato esperado pelo backend
      const itensServico = novoOrcamento.servicos.map(servico => ({
        descricao: servico.descricao || 'Serviço sem descrição',
        valorMaoDeObra: servico.valorMaoDeObra || 0,
        tempoEstimado: servico.tempoEstimado || 1,
        materiais: novoOrcamento.materiais.map(material => ({
          descricao: material.descricao || 'Material sem descrição',
          quantidade: material.quantidade || 1,
          unidade: 'un',
          valorUnitario: material.valorUnitario || 0,
          valorTotal: material.valorTotal || 0
        }))
      }));
      
      await createOrcamento({
        solicitacaoId: novoOrcamento.solicitacaoId,
        prestadorId: prestadorAtual?.id || 'master-user', // Para usuários master sem prestador
        itensServico,
        taxaAdm: novoOrcamento.taxaAdm,
        prazoExecucao: novoOrcamento.prazoExecucao,
        observacoes: novoOrcamento.observacoes
      });
      
      fecharDialog();
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
    }
  };

  // Encontrar o prestador associado ao usuário atual
  const prestadorAtual = prestadores.find(p => p.usuarioId === usuario?.id);
  
  // Filtrar solicitações abertas (onde pode criar orçamentos)
  const solicitacoesAbertas = useMemo(() => {
    // Se for usuário master ou admin, mostrar baseado no modo de visualização
    if (usuario?.isMaster || usuario?.isAdmin) {
      if (viewMode === 'gestor') {
        // Modo gestor: ver todas as solicitações abertas
        return solicitacoes.filter(solicitacao => 
          ['aberta', 'orcamento'].includes(solicitacao.status)
        );
      } else if (viewMode === 'prestador') {
        // Modo prestador: ver como se fosse um prestador
        if (!prestadorAtual) return [];
        
        return solicitacoes.filter(solicitacao => {
          if (!['aberta', 'orcamento'].includes(solicitacao.status)) {
            return false;
          }
          
          const temOrcamentoAprovadoOutroPrestador = orcamentos.some(orc => 
            orc.solicitacaoId === solicitacao.id && 
            (orc.status === 'aprovado' || orc.isPrincipal) &&
            orc.prestadorId !== prestadorAtual.id
          );
          
          if (temOrcamentoAprovadoOutroPrestador) {
            return false;
          }
          
          const jaEnviouOrcamentoFinalizado = orcamentos.some(orc => 
            orc.solicitacaoId === solicitacao.id && 
            orc.prestadorId === prestadorAtual.id && 
            orc.status !== 'rascunho'
          );
          
          return !jaEnviouOrcamentoFinalizado;
        });
      } else {
        // Modo usuário: ver apenas suas próprias solicitações
        return solicitacoes.filter(solicitacao => 
          solicitacao.usuarioId === usuario.id &&
          ['aberta', 'orcamento'].includes(solicitacao.status)
        );
      }
    }
    
    // Para usuários não master/admin (prestadores normais)
    if (!prestadorAtual) return [];
    
    return solicitacoes.filter(solicitacao => {
      if (!['aberta', 'orcamento'].includes(solicitacao.status)) {
        return false;
      }
      
      const temOrcamentoAprovadoOutroPrestador = orcamentos.some(orc => 
        orc.solicitacaoId === solicitacao.id && 
        (orc.status === 'aprovado' || orc.isPrincipal) &&
        orc.prestadorId !== prestadorAtual.id
      );
      
      if (temOrcamentoAprovadoOutroPrestador) {
        return false;
      }
      
      const jaEnviouOrcamentoFinalizado = orcamentos.some(orc => 
        orc.solicitacaoId === solicitacao.id && 
        orc.prestadorId === prestadorAtual.id && 
        orc.status !== 'rascunho'
      );
      
      return !jaEnviouOrcamentoFinalizado;
    });
  }, [solicitacoes, orcamentos, prestadorAtual, usuario, viewMode]);
  
  // Filtrar histórico (solicitações onde o prestador tem orçamento aprovado)
  const historicoSolicitacoes = useMemo(() => {
    // Se for usuário master ou admin, mostrar baseado no modo de visualização
    if (usuario?.isMaster || usuario?.isAdmin) {
      if (viewMode === 'gestor') {
        // Modo gestor: ver todas as solicitações em execução/concluídas
        return solicitacoes.filter(solicitacao => 
          ['execucao', 'concluida', 'paga'].includes(solicitacao.status)
        );
      } else if (viewMode === 'prestador') {
        // Modo prestador: ver histórico como prestador
        if (!prestadorAtual) return [];
        
        return solicitacoes.filter(solicitacao => {
          if (['execucao', 'concluida', 'paga'].includes(solicitacao.status)) {
            const temOrcamentoAprovadoDoPrestador = orcamentos.some(orc => 
              orc.solicitacaoId === solicitacao.id && 
              orc.prestadorId === prestadorAtual.id &&
              (orc.status === 'aprovado' || orc.isPrincipal)
            );
            
            return temOrcamentoAprovadoDoPrestador;
          }
          
          return false;
        });
      } else {
        // Modo usuário: ver apenas suas próprias solicitações concluídas
        return solicitacoes.filter(solicitacao => 
          solicitacao.usuarioId === usuario.id &&
          ['execucao', 'concluida', 'paga'].includes(solicitacao.status)
        );
      }
    }
    
    if (!prestadorAtual) return [];
    
    return solicitacoes.filter(solicitacao => {
      // Incluir solicitações em execução/concluídas onde o prestador tem orçamento aprovado
      if (['execucao', 'concluida', 'paga'].includes(solicitacao.status)) {
        const temOrcamentoAprovadoDoPrestador = orcamentos.some(orc => 
          orc.solicitacaoId === solicitacao.id && 
          orc.prestadorId === prestadorAtual.id &&
          (orc.status === 'aprovado' || orc.isPrincipal)
        );
        
        return temOrcamentoAprovadoDoPrestador;
      }
      
      return false;
    });
  }, [solicitacoes, orcamentos, prestadorAtual, usuario, viewMode]);

  // Função para obter informações resumidas dos serviços
  const getServicosResumo = (servicos: any[]) => {
    if (!servicos || servicos.length === 0) return 'Nenhum serviço especificado';
    
    const tiposServico = servicos.map(s => s.tipoServico?.nome || s.descricao || 'Serviço não especificado');
    if (tiposServico.length === 1) return tiposServico[0];
    if (tiposServico.length <= 3) return tiposServico.join(', ');
    return `${tiposServico.slice(0, 2).join(', ')} e mais ${tiposServico.length - 2} serviços`;
  };

  // Função para contar orçamentos já enviados para uma solicitação
  const contarOrcamentosEnviados = (solicitacaoId: string) => {
    return orcamentos.filter(orc => orc.solicitacaoId === solicitacaoId).length;
  };

  const totais = calcularTotais();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando orçamentos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-muted-foreground mt-1">
            {viewMode === 'provider'
              ? 'Crie orçamentos detalhados para as solicitações'
              : viewMode === 'manager'
              ? 'Gerencie todos os orçamentos do sistema'
              : 'Visualize orçamentos recebidos para suas solicitações'
            }
          </p>
        </div>
      </div>

      {/* Navegação por Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="solicitacoes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Oportunidades ({solicitacoesAbertas.length})
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {usuario?.isMaster ? 'Histórico Completo' : 'Meu Histórico'} ({historicoSolicitacoes.length})
          </TabsTrigger>
          <TabsTrigger value="meus-orcamentos" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            {usuario?.isMaster ? 'Todos os Orçamentos' : 'Meus Orçamentos'}
          </TabsTrigger>
        </TabsList>

        {/* Tab de Oportunidades */}
        <TabsContent value="solicitacoes" className="space-y-4">
          <div className="grid gap-4">
            {solicitacoesAbertas.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Nenhuma oportunidade disponível para orçamento no momento.</p>
                </CardContent>
              </Card>
            ) : (
              solicitacoesAbertas.map((solicitacao) => {
                // Mapear dados do imóvel que estão diretamente na solicitação
                const imovel = {
                  rua: solicitacao.enderecoRua || '',
                  numero: solicitacao.enderecoNumero || '',
                  complemento: solicitacao.enderecoComplemento || '',
                  bairro: solicitacao.enderecoBairro || '',
                  cidade: solicitacao.enderecoCidade || '',
                  tipo: solicitacao.tipoImovel || ''
                };
                
                return (
                  <Card key={solicitacao.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            Solicitação #{solicitacao.id.slice(-6)}
                            <Badge variant="secondary" className="text-xs">
                              {solicitacao.servicos?.length || 0} serviço(s)
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {getServicosResumo(solicitacao.servicos)}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Criada em {(() => {
                              try {
                                const date = solicitacao.dataSolicitacao ? new Date(solicitacao.dataSolicitacao) : null;
                                return date && !isNaN(date.getTime()) ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Data não informada';
                              } catch {
                                return 'Data não informada';
                              }
                            })()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={solicitacao.status === 'aberta' ? 'destructive' : 'default'}>
                            {solicitacao.status === 'aberta' ? 'Aberta' : 'Em Orçamento'}
                          </Badge>
                          {contarOrcamentosEnviados(solicitacao.id) > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {contarOrcamentosEnviados(solicitacao.id)} orçamento(s) enviado(s)
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Informações do Imóvel */}
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">Endereço do Imóvel</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="font-medium">{imovel.rua || 'Rua não informada'}, {imovel.numero || 'S/N'}</p>
                              {imovel.complemento && <p className="text-muted-foreground">{imovel.complemento}</p>}
                              <p className="text-muted-foreground">{imovel.bairro || 'Bairro não informado'} - {imovel.cidade || 'Cidade não informada'}</p>
                              {imovel.tipo && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {imovel.tipo.charAt(0).toUpperCase() + imovel.tipo.slice(1)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Serviços Solicitados */}
                        <div>
                          <h4 className="font-medium text-sm mb-2">Serviços Solicitados:</h4>
                          <div className="space-y-2">
                            {solicitacao.servicos.map((servico, index) => (
                              <div key={servico.id || index} className="flex items-center justify-between p-2 bg-background border rounded">
                                <div>
                                  <p className="text-sm font-medium">{servico.tipoServico?.nome || servico.descricao || 'Serviço não especificado'}</p>
                                  {servico.observacoes && (
                                    <p className="text-xs text-muted-foreground">{servico.observacoes}</p>
                                  )}
                                  {servico.descricao && servico.tipoServico?.nome && servico.descricao !== servico.tipoServico.nome && (
                                    <p className="text-xs text-muted-foreground mt-1">{servico.descricao}</p>
                                  )}
                                </div>
                                <Badge 
                                  variant={servico.prioridade === 'urgente' ? 'destructive' : 
                                          servico.prioridade === 'alta' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {servico.prioridade || 'normal'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Observações Gerais */}
                        {solicitacao.observacoesGerais && (
                          <div>
                            <h4 className="font-medium text-sm mb-1">Observações:</h4>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                              {solicitacao.observacoesGerais}
                            </p>
                          </div>
                        )}
                        
                        {/* Informações Adicionais */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p><strong>Solicitante:</strong> {solicitacao.nomeSolicitante || 'Nome não informado'}</p>
                              <p className="text-muted-foreground">{solicitacao.tipoSolicitante}</p>
                            </div>
                          </div>

                          {solicitacao.prioridade && solicitacao.prioridade !== 'media' && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className={`h-4 w-4 ${
                                solicitacao.prioridade === 'alta' ? 'text-red-500' : 'text-yellow-500'
                              }`} />
                              <Badge variant={solicitacao.prioridade === 'alta' ? 'destructive' : 'secondary'} className="text-xs">
                                Prioridade {solicitacao.prioridade}
                              </Badge>
                            </div>
                          )}
                          
                          {solicitacao.observacoesGerais && (
                             <div className="flex items-start gap-2">
                               <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                               <p className="text-sm">
                                 <strong>Observações:</strong> {solicitacao.observacoesGerais}
                               </p>
                             </div>
                           )}
                           
                           {solicitacao.prazoDesejado && (
                             <div className="flex items-center gap-2">
                               <Clock className="h-4 w-4 text-muted-foreground" />
                               <p className="text-sm">
                                 <strong>Prazo desejado:</strong> {(() => {
                                   try {
                                     const date = solicitacao.prazoDesejado ? new Date(solicitacao.prazoDesejado) : null;
                                     return date && !isNaN(date.getTime()) ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Não definido';
                                   } catch {
                                     return 'Não definido';
                                   }
                                 })()}
                               </p>
                             </div>
                           )}
                           
                           <div className="flex justify-end pt-2 border-t">
                             <Button onClick={() => abrirNovoOrcamento(solicitacao)} size="sm">
                               <Plus className="h-4 w-4 mr-2" />
                               Criar Orçamento
                             </Button>
                           </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Tab do Histórico */}
        <TabsContent value="historico" className="space-y-4">
          <div className="grid gap-4">
            {historicoSolicitacoes.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">
                    {usuario?.isMaster 
                      ? 'Nenhum trabalho foi realizado ainda.' 
                      : 'Nenhum trabalho realizado ainda.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              historicoSolicitacoes.map((solicitacao) => {
                // Buscar o orçamento aprovado para esta solicitação
                const orcamentoAprovado = usuario?.isMaster 
                  ? orcamentos.find(orc => 
                      orc.solicitacaoId === solicitacao.id && 
                      (orc.status === 'aprovado' || orc.isPrincipal)
                    )
                  : orcamentos.find(orc => 
                      orc.solicitacaoId === solicitacao.id && 
                      orc.prestadorId === prestadorAtual?.id &&
                      (orc.status === 'aprovado' || orc.isPrincipal)
                    );
                
                const imovel = solicitacao.imovel || {};
                
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'execucao': return 'bg-blue-100 text-blue-800';
                    case 'concluida': return 'bg-green-100 text-green-800';
                    case 'paga': return 'bg-emerald-100 text-emerald-800';
                    default: return 'bg-gray-100 text-gray-800';
                  }
                };
                
                const getStatusText = (status: string) => {
                  switch (status) {
                    case 'execucao': return 'Em Execução';
                    case 'concluida': return 'Concluída';
                    case 'paga': return 'Paga';
                    default: return status;
                  }
                };
                
                return (
                  <Card key={solicitacao.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            Trabalho #{solicitacao.id.slice(-6)}
                            <Badge className={getStatusColor(solicitacao.status)}>
                              {getStatusText(solicitacao.status)}
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {getServicosResumo(solicitacao.servicos)}
                          </p>
                        </div>
                        {orcamentoAprovado && (
                          <div className="text-right">
                            <p className="text-lg font-semibold text-green-600">
                              R$ {orcamentoAprovado.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                            </p>
                            <p className="text-xs text-muted-foreground">Valor aprovado</p>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Informações do Imóvel */}
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">
                              {imovel.endereco || 'Endereço não informado'}
                            </p>
                            {imovel.cidade && (
                              <p className="text-xs text-muted-foreground">{imovel.cidade}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Informações do Solicitante */}
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">
                            <strong>Solicitante:</strong> {solicitacao.usuario?.nome || 'Não informado'}
                          </p>
                        </div>
                        
                        {/* Data de conclusão ou execução */}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">
                            <strong>Status desde:</strong> {(() => {
                              try {
                                const date = solicitacao.updatedAt ? new Date(solicitacao.updatedAt) : null;
                                return date && !isNaN(date.getTime()) ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Não informado';
                              } catch {
                                return 'Não informado';
                              }
                            })()}
                          </p>
                        </div>
                        
                        {/* Indicador de pagamento */}
                        {solicitacao.status === 'paga' && (
                          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <p className="text-sm text-green-700 font-medium">Pagamento realizado</p>
                          </div>
                        )}
                        
                        {solicitacao.status === 'concluida' && (
                          <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-md">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <p className="text-sm text-yellow-700 font-medium">Aguardando pagamento</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Tab de Meus Orçamentos */}
        <TabsContent value="meus-orcamentos" className="space-y-4">
          <div className="grid gap-4">
            {(() => {
              // Filtrar orçamentos baseado no modo de visualização
              let orcamentosFiltrados = [];
              
              if (usuario?.isMaster || usuario?.isAdmin) {
                if (viewMode === 'gestor') {
                  // Modo gestor: ver todos os orçamentos
                  orcamentosFiltrados = orcamentos;
                } else if (viewMode === 'prestador') {
                  // Modo prestador: ver apenas orçamentos do prestador atual
                  orcamentosFiltrados = orcamentos.filter(orc => orc.prestadorId === prestadorAtual?.id);
                } else {
                  // Modo usuário: ver orçamentos das suas solicitações
                  const minhasSolicitacoes = solicitacoes.filter(s => s.usuarioId === usuario.id);
                  orcamentosFiltrados = orcamentos.filter(orc => 
                    minhasSolicitacoes.some(s => s.id === orc.solicitacaoId)
                  );
                }
              } else {
                // Usuário normal: ver apenas seus próprios orçamentos
                if (prestadorAtual) {
                  orcamentosFiltrados = orcamentos.filter(orc => orc.prestadorId === prestadorAtual.id);
                } else {
                  orcamentosFiltrados = [];
                }
              }
              
              return orcamentosFiltrados.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">
                      {viewMode === 'gestor' 
                         ? 'Nenhum orçamento foi criado ainda.' 
                         : viewMode === 'prestador'
                        ? 'Você ainda não criou nenhum orçamento.'
                        : 'Nenhum orçamento foi recebido para suas solicitações.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                orcamentosFiltrados
                .map((orcamento) => {
                  const solicitacao = solicitacoes.find(s => s.id === orcamento.solicitacaoId);
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
                            {usuario?.isMaster && (
                              <p className="text-xs text-blue-600 font-medium">
                                Prestador: {prestadores.find(p => p.id === orcamento.prestadorId)?.nome || 'N/A'}
                              </p>
                            )}
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
                            <p className="font-semibold">R$ {(orcamento.materiais || 0).toLocaleString('pt-BR')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Mão de Obra</p>
                            <p className="font-semibold">R$ {(orcamento.maoDeObra || 0).toLocaleString('pt-BR')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Prazo</p>
                            <p className="font-semibold">{orcamento.prazoExecucao} dias</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-bold text-lg">R$ {(orcamento.total || 0).toLocaleString('pt-BR')}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              );
            })()}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para Criar Novo Orçamento */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          fecharDialog();
        } else {
          setIsDialogOpen(true);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Novo Orçamento - {selectedSolicitacao?.tipoManutencao}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Informações da Solicitação */}
            {selectedSolicitacao ? (
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
            ) : (
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <p className="text-red-600">⚠️ Erro: Dados da solicitação não encontrados</p>
                <p className="text-sm text-red-500 mt-1">Por favor, feche este dialog e tente novamente.</p>
              </div>
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
                          value={`R$ ${(material.valorTotal || 0).toLocaleString('pt-BR')}`}
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
              <Button variant="outline" onClick={fecharDialog}>
                Cancelar
              </Button>
              <Button 
                onClick={salvarOrcamento}
                disabled={novoOrcamento.servicos.length === 0}
                className={novoOrcamento.servicos.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Salvar Orçamento
              </Button>
            </div>
            
            {/* Aviso quando não há serviços */}
            {novoOrcamento.servicos.length === 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Adicione pelo menos um serviço para poder salvar o orçamento.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orcamentos;