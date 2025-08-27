import { useState, useMemo } from 'react';
import { Orcamento } from '@/types';
import { mockOrcamentos, mockSolicitacoes, mockPrestadores } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

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
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(mockOrcamentos);
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

  // Função para gerar ID único
  const generateUniqueId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORC-${timestamp}-${random}`;
  };

  // Orçamentos filtrados e ordenados
  const filteredOrcamentos = useMemo(() => {
    let filtered = orcamentos.filter((orcamento) => {
      // Filtro por solicitação
      if (filters.solicitacaoId !== 'all' && orcamento.solicitacaoId !== filters.solicitacaoId) {
        return false;
      }

      // Filtro por prestador
      if (filters.prestadorId !== 'all' && orcamento.prestador.id !== filters.prestadorId) {
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
        const solicitacao = mockSolicitacoes.find(s => s.id === orcamento.solicitacaoId);
        return (
          orcamento.prestador.nome.toLowerCase().includes(searchLower) ||
          solicitacao?.tipoManutencao.toLowerCase().includes(searchLower) ||
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
        case 'prestador-asc':
          return a.prestador.nome.localeCompare(b.prestador.nome);
        case 'prestador-desc':
          return b.prestador.nome.localeCompare(a.prestador.nome);
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
      valorTotal
    };
  }, [filteredOrcamentos]);

  // Criar orçamento
  const createOrcamento = (orcamentoData: Omit<Orcamento, 'id'>) => {
    try {
      const newOrcamento: Orcamento = {
        ...orcamentoData,
        id: generateUniqueId()
      };
      
      setOrcamentos(prev => [...prev, newOrcamento]);
      
      toast({
        title: "Orçamento criado",
        description: `Orçamento ${newOrcamento.id} criado com sucesso.`,
      });
      
      return newOrcamento;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar orçamento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Atualizar orçamento
  const updateOrcamento = (id: string, updates: Partial<Orcamento>) => {
    try {
      setOrcamentos(prev => 
        prev.map(orcamento => 
          orcamento.id === id 
            ? { ...orcamento, ...updates }
            : orcamento
        )
      );
      
      toast({
        title: "Orçamento atualizado",
        description: "Orçamento atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar orçamento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Deletar orçamento
  const deleteOrcamento = (id: string) => {
    try {
      setOrcamentos(prev => prev.filter(orcamento => orcamento.id !== id));
      
      toast({
        title: "Orçamento removido",
        description: "Orçamento removido com sucesso.",
      });
    } catch (error) {
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
      sortOrder: 'desc'
    });
  };

  return {
    orcamentos: filteredOrcamentos,
    filteredOrcamentos,
    groupedOrcamentos,
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

// Alterar de:
// export default useOrcamentos;

// Para:
export { useOrcamentos };