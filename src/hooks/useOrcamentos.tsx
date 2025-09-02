import { useState, useMemo, useEffect } from 'react';
import { Orcamento, Solicitacao, Prestador } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface OrcamentoFilters {
  searchTerm: string;
  solicitacaoId: string;
  prestadorId: string;
  precoMin?: number;
  precoMax?: number;
  prazoMax?: number;
  sortBy: 'preco-asc' | 'preco-desc' | 'prazo-asc' | 'prazo-desc' | 'data-asc' | 'data-desc' | 'prestador-asc' | 'prestador-desc';
}

const useOrcamentos = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<OrcamentoFilters>({
    searchTerm: '',
    solicitacaoId: 'all',
    prestadorId: 'all',
    precoMin: 0,
    precoMax: 50000,
    prazoMax: 30,
    sortBy: 'data-desc'
  });
  const { toast } = useToast();
  const { usuario } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || '';

  // Função para buscar dados do backend
  const fetchOrcamentos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/orcamentos`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erro ao buscar orçamentos');
      
      const data = await response.json();
      
      setOrcamentos(data.map((orc: any) => ({
        ...orc,
        dataOrcamento: new Date(orc.dataOrcamento),
        dataAprovacao: orc.dataAprovacao ? new Date(orc.dataAprovacao) : undefined,
        dataVisita: orc.dataVisita ? new Date(orc.dataVisita) : undefined
      })));
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar orçamentos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSolicitacoes = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/solicitacoes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erro ao buscar solicitações');
      
      const data = await response.json();
      
      // A API retorna { solicitacoes: [...] }
      const solicitacoes = data.solicitacoes || data;
      setSolicitacoes(solicitacoes.map((sol: any) => ({
        ...sol,
        dataSolicitacao: new Date(sol.dataSolicitacao),
        prazoDesejado: new Date(sol.prazoDesejado),
        dataAprovacao: sol.dataAprovacao ? new Date(sol.dataAprovacao) : undefined,
        dataConclusao: sol.dataConclusao ? new Date(sol.dataConclusao) : undefined
      })));
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
    }
  };

  const fetchPrestadores = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/prestadores`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erro ao buscar prestadores');
      
      const data = await response.json();
      
      setPrestadores(data.map((prest: any) => ({
        ...prest,
        dataCadastro: new Date(prest.dataCadastro)
      })));
    } catch (error) {
      console.error('Erro ao buscar prestadores:', error);
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    if (usuario) {
      fetchOrcamentos();
      fetchSolicitacoes();
      fetchPrestadores();
    }
  }, [usuario]);

  // Orçamentos filtrados e ordenados
  const filteredOrcamentos = useMemo(() => {
    let filtered = orcamentos.filter((orcamento) => {
      // Filtro por solicitação
      if (filters.solicitacaoId !== 'all' && orcamento.solicitacaoId !== filters.solicitacaoId) {
        return false;
      }

      // Filtro por prestador
      if (filters.prestadorId !== 'all' && orcamento.prestadorId !== filters.prestadorId) {
        return false;
      }

      // Filtro por preço
      if (filters.precoMin && orcamento.total < filters.precoMin) {
        return false;
      }
      if (filters.precoMax && orcamento.total > filters.precoMax) {
        return false;
      }

      // Filtro por prazo
      if (filters.prazoMax && orcamento.prazoExecucao > filters.prazoMax) {
        return false;
      }

      // Filtro por busca
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const solicitacao = solicitacoes.find(s => s.id === orcamento.solicitacaoId);
        const prestador = prestadores.find(p => p.id === orcamento.prestadorId);
        return (
          prestador?.nome.toLowerCase().includes(searchLower) ||
          solicitacao?.observacoesGerais?.toLowerCase().includes(searchLower) ||
          solicitacao?.imovelId.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });

    // Ordenação
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'preco-asc':
          return a.total - b.total;
        case 'preco-desc':
          return b.total - a.total;
        case 'prazo-asc':
          return a.prazoExecucao - b.prazoExecucao;
        case 'prazo-desc':
          return b.prazoExecucao - a.prazoExecucao;
        case 'data-asc':
          return a.dataOrcamento.getTime() - b.dataOrcamento.getTime();
        case 'data-desc':
          return b.dataOrcamento.getTime() - a.dataOrcamento.getTime();
        case 'prestador-asc': {
          const prestadorA = prestadores.find(p => p.id === a.prestadorId);
          const prestadorB = prestadores.find(p => p.id === b.prestadorId);
          return (prestadorA?.nome || '').localeCompare(prestadorB?.nome || '');
        }
        case 'prestador-desc': {
          const prestadorA = prestadores.find(p => p.id === a.prestadorId);
          const prestadorB = prestadores.find(p => p.id === b.prestadorId);
          return (prestadorB?.nome || '').localeCompare(prestadorA?.nome || '');
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [orcamentos, filters]);

  // Orçamentos agrupados por solicitação
  const groupedOrcamentos = useMemo(() => {
    return filteredOrcamentos.reduce((acc, orcamento) => {
      const solicitacaoId = orcamento.solicitacaoId;
      if (!acc[solicitacaoId]) acc[solicitacaoId] = [];
      acc[solicitacaoId].push(orcamento);
      return acc;
    }, {} as Record<string, Orcamento[]>);
  }, [filteredOrcamentos]);

  // Estatísticas
  const statistics = useMemo(() => {
    const total = filteredOrcamentos.length;
    const aprovados = filteredOrcamentos.filter(o => o.isPrincipal).length;
    const menorPreco = filteredOrcamentos.length > 0 
      ? Math.min(...filteredOrcamentos.map(o => o.total))
      : 0;
    const maiorPreco = filteredOrcamentos.length > 0
      ? Math.max(...filteredOrcamentos.map(o => o.total))
      : 0;
    const precoMedio = filteredOrcamentos.length > 0
      ? filteredOrcamentos.reduce((sum, o) => sum + o.total, 0) / filteredOrcamentos.length
      : 0;
    const valorTotal = filteredOrcamentos.length > 0
      ? filteredOrcamentos.reduce((sum, o) => sum + o.total, 0)
      : 0;
  
    return {
      total,
      aprovados,
      pendentes: total - aprovados,
      menorPreco,
      maiorPreco,
      precoMedio,
      valorTotal  // ✅ Propriedade presente
    };
  }, [filteredOrcamentos]);

  // Criar orçamento
  const createOrcamento = async (orcamentoData: Omit<Orcamento, 'id' | 'dataOrcamento'>) => {
    try {
      const response = await fetch(`${API_BASE}/api/orcamentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orcamentoData)
      });
      
      if (!response.ok) throw new Error('Erro ao criar orçamento');
      
      const newOrcamento = await response.json();
      
      // Atualizar estado local
      setOrcamentos(prev => [...prev, {
        ...newOrcamento,
        dataOrcamento: new Date(newOrcamento.dataOrcamento),
        dataAprovacao: newOrcamento.dataAprovacao ? new Date(newOrcamento.dataAprovacao) : undefined,
        dataVisita: newOrcamento.dataVisita ? new Date(newOrcamento.dataVisita) : undefined
      }]);
      
      toast({
        title: "Orçamento criado",
        description: `Orçamento criado com sucesso.`,
      });
      
      return newOrcamento;
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar orçamento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Atualizar orçamento
  const updateOrcamento = async (id: string, updates: Partial<Orcamento>) => {
    try {
      const response = await fetch(`${API_BASE}/api/orcamentos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Erro ao atualizar orçamento');
      
      const updatedOrcamento = await response.json();
      
      // Atualizar estado local
      setOrcamentos(prev => 
        prev.map(orcamento => 
          orcamento.id === id 
            ? {
                ...updatedOrcamento,
                dataOrcamento: new Date(updatedOrcamento.dataOrcamento),
                dataAprovacao: updatedOrcamento.dataAprovacao ? new Date(updatedOrcamento.dataAprovacao) : undefined,
                dataVisita: updatedOrcamento.dataVisita ? new Date(updatedOrcamento.dataVisita) : undefined
              }
            : orcamento
        )
      );
      
      toast({
        title: "Orçamento atualizado",
        description: "Orçamento atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar orçamento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Deletar orçamento
  const deleteOrcamento = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/orcamentos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erro ao deletar orçamento');
      
      // Atualizar estado local
      setOrcamentos(prev => prev.filter(orcamento => orcamento.id !== id));
      
      toast({
        title: "Orçamento removido",
        description: "Orçamento removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar orçamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover orçamento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Marcar como principal
  const setAsPrincipal = (solicitacaoId: string, orcamentoId: string) => {
    try {
      setOrcamentos(prev => 
        prev.map(orcamento => {
          if (orcamento.solicitacaoId === solicitacaoId) {
            return {
              ...orcamento,
              isPrincipal: orcamento.id === orcamentoId
            };
          }
          return orcamento;
        })
      );
      
      toast({
        title: "Orçamento principal definido",
        description: "Orçamento marcado como principal com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao definir orçamento principal.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Atualizar filtros
  const updateFilters = (newFilters: Partial<OrcamentoFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Resetar filtros
  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      solicitacaoId: 'all',
      prestadorId: 'all',
      precoMin: 0,
      precoMax: 999999,
      prazoMax: 365,
      sortBy: 'data-desc',
      // Remove sortOrder since it's not in OrcamentoFilters type
    });
  };

  return {
    orcamentos: filteredOrcamentos,
    filteredOrcamentos,
    groupedOrcamentos,
    solicitacoes,
    prestadores,
    loading,
    filters,
    statistics,
    createOrcamento,
    updateOrcamento,
    deleteOrcamento,
    setAsPrincipal,
    updateFilters,
    resetFilters
  };
};

export default useOrcamentos;