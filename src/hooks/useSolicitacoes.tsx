import { useState, useEffect } from 'react';
import { Solicitacao } from '@/types';
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
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SolicitacaoFilters>({
    search: '',
    status: 'todas',
    tipoManutencao: 'todos',
    tipoSolicitante: 'todos',
    prioridade: 'todas'
  });
  const { toast } = useToast();

  // Função para buscar solicitações do backend
  const fetchSolicitacoes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/solicitacoes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar solicitações');
      }
      
      const data = await response.json();
      
      // Transformar dados do backend para o formato esperado pelo frontend
      const solicitacoesFormatadas = data.solicitacoes.map((sol: any) => ({
        id: sol.id,
        imovelId: `${sol.imovel.tipo.toUpperCase()}-${sol.imovel.numero}`,
        tipoSolicitante: sol.tipoSolicitante,
        nome: sol.nomeSolicitante,
        telefone: sol.telefoneSolicitante,
        endereco: `${sol.imovel.rua}, ${sol.imovel.numero}${sol.imovel.complemento ? ` - ${sol.imovel.complemento}` : ''} - ${sol.imovel.bairro}`,
        cidade: sol.imovel.cidade,
        tipoManutencao: sol.servicos[0]?.tipoServico?.nome || 'Serviço Geral',
        dataSolicitacao: new Date(sol.createdAt),
        prazoFinal: sol.prazoDesejado ? new Date(sol.prazoDesejado) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        descricao: sol.observacoesGerais || sol.servicos[0]?.descricao || '',
        status: sol.status || 'aberta'
      }));
      
      setSolicitacoes(solicitacoesFormatadas);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      toast({
        title: 'Erro ao carregar solicitações',
        description: 'Não foi possível carregar as solicitações. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar solicitações quando o componente for montado
  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const filteredSolicitacoes = solicitacoes.filter(solicitacao => {
    const matchesSearch = 
      solicitacao.nome?.toLowerCase().includes(filters.search.toLowerCase()) ||
      (solicitacao as any).tipoManutencao?.toLowerCase().includes(filters.search.toLowerCase()) ||
      solicitacao.endereco.toLowerCase().includes(filters.search.toLowerCase()) ||
      solicitacao.imovelId.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === 'todas' || solicitacao.status === filters.status;
    const matchesTipo = filters.tipoManutencao === 'todos' || solicitacao.tipoManutencao === filters.tipoManutencao;
    const matchesSolicitante = filters.tipoSolicitante === 'todos' || solicitacao.tipoSolicitante === filters.tipoSolicitante;
    
    return matchesSearch && matchesStatus && matchesTipo && matchesSolicitante;
  });

  const createSolicitacao = async (data: Partial<Solicitacao>) => {
    // Esta função agora apenas recarrega os dados
    // A criação real é feita via API no SolicitacaoInquilino.tsx
    await fetchSolicitacoes();
    return data as Solicitacao;
  };

  const updateSolicitacao = async (id: string, data: Partial<Solicitacao>) => {
    setLoading(true);
    try {
      // Por enquanto, apenas atualizamos localmente
      // TODO: Implementar endpoint PUT/PATCH no backend para atualização completa
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
      // Por enquanto, apenas removemos localmente
      // TODO: Implementar endpoint DELETE no backend
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

  const changeStatus = async (id: string, newStatus: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/solicitacoes/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }
      
      // Recarregar dados após atualização
      await fetchSolicitacoes();
      
      const statusLabels = {
        'aberta': 'Aberta',
        'orcamento': 'Aguardando Orçamento',
        'aprovada': 'Aprovada',
        'execucao': 'Em Execução',
        'concluida': 'Concluída',
        'cancelada': 'Cancelada'
      };
      
      toast({
        title: 'Status atualizado!',
        description: `Solicitação alterada para: ${statusLabels[newStatus] || newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao alterar status',
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
    deleteSolicitacao,
    changeStatus,
    reloadSolicitacoes: fetchSolicitacoes
  };
};