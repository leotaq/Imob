import { useState, useEffect } from 'react';
import { Solicitacao } from '@/types';
import { mockSolicitacoes } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export interface SolicitacaoFilters {
  search: string;
  status: string;
  tipoManutencao: string;
  tipoSolicitante: string;
  dataInicio?: Date;
  dataFim?: Date;
  prioridade: string;
}

export const useSolicitacoes = () => {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(mockSolicitacoes);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SolicitacaoFilters>({
    search: '',
    status: 'todas',
    tipoManutencao: 'todos',
    tipoSolicitante: 'todos',
    prioridade: 'todas'
  });
  const { toast } = useToast();

  const filteredSolicitacoes = solicitacoes.filter(solicitacao => {
    const matchesSearch = 
      solicitacao.nome.toLowerCase().includes(filters.search.toLowerCase()) ||
      solicitacao.tipoManutencao.toLowerCase().includes(filters.search.toLowerCase()) ||
      solicitacao.endereco.toLowerCase().includes(filters.search.toLowerCase()) ||
      solicitacao.imovelId.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === 'todas' || solicitacao.status === filters.status;
    const matchesTipo = filters.tipoManutencao === 'todos' || solicitacao.tipoManutencao === filters.tipoManutencao;
    const matchesSolicitante = filters.tipoSolicitante === 'todos' || solicitacao.tipoSolicitante === filters.tipoSolicitante;
    
    return matchesSearch && matchesStatus && matchesTipo && matchesSolicitante;
  });

  const createSolicitacao = async (data: Partial<Solicitacao>) => {
    setLoading(true);
    try {
      const novaSolicitacao: Solicitacao = {
        id: Date.now().toString(),
        dataSolicitacao: new Date(),
        status: 'aberta',
        ...data
      } as Solicitacao;
      
      setSolicitacoes(prev => [novaSolicitacao, ...prev]);
      toast({
        title: 'Solicitação criada com sucesso!',
        description: `Solicitação para ${data.tipoManutencao} foi criada.`,
      });
      return novaSolicitacao;
    } catch (error) {
      toast({
        title: 'Erro ao criar solicitação',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSolicitacao = async (id: string, data: Partial<Solicitacao>) => {
    setLoading(true);
    try {
      setSolicitacoes(prev => 
        prev.map(s => s.id === id ? { ...s, ...data } : s)
      );
      toast({
        title: 'Solicitação atualizada!',
        description: 'As alterações foram salvas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar solicitação',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteSolicitacao = async (id: string) => {
    setLoading(true);
    try {
      setSolicitacoes(prev => prev.filter(s => s.id !== id));
      toast({
        title: 'Solicitação excluída!',
        description: 'A solicitação foi removida com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir solicitação',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    solicitacoes: filteredSolicitacoes,
    allSolicitacoes: solicitacoes,
    loading,
    filters,
    setFilters,
    createSolicitacao,
    updateSolicitacao,
    deleteSolicitacao
  };
};