import { useState, useEffect } from 'react';
import { Comentario, HistoricoCompleto } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Mock data para demonstração
const mockComentarios: Comentario[] = [];
const mockHistorico: HistoricoCompleto[] = [];

export const useComentarios = (solicitacaoId: string) => {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [historico, setHistorico] = useState<HistoricoCompleto[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Carregar comentários e histórico da solicitação
  useEffect(() => {
    const comentariosFiltrados = mockComentarios.filter(
      c => c.solicitacaoId === solicitacaoId
    );
    const historicoFiltrado = mockHistorico.filter(
      h => h.solicitacaoId === solicitacaoId
    );
    
    setComentarios(comentariosFiltrados);
    setHistorico(historicoFiltrado);
  }, [solicitacaoId]);

  const addComentario = async (texto: string) => {
    setLoading(true);
    try {
      const novoComentario: Comentario = {
        id: Date.now().toString(),
        solicitacaoId,
        usuario: 'Usuário Atual', // Em produção, pegar do contexto de auth
        texto,
        data: new Date(),
        tipo: 'comentario'
      };

      setComentarios(prev => [novoComentario, ...prev]);
      
      // Adicionar ao histórico também
      const historicoItem: HistoricoCompleto = {
        id: (Date.now() + 1).toString(),
        solicitacaoId,
        tipo: 'comentario',
        usuario: 'Usuário Atual',
        data: new Date(),
        descricao: `Adicionou um comentário: "${texto.substring(0, 50)}${texto.length > 50 ? '...' : ''}"`,
        detalhes: {
          comentario: texto
        }
      };
      
      setHistorico(prev => [historicoItem, ...prev]);
      
      toast({
        title: 'Comentário adicionado!',
        description: 'Seu comentário foi salvo com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao adicionar comentário',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addHistoricoStatus = (statusAnterior: string, statusNovo: string, observacao?: string) => {
    const historicoItem: HistoricoCompleto = {
      id: Date.now().toString(),
      solicitacaoId,
      tipo: 'status',
      usuario: 'Usuário Atual',
      data: new Date(),
      descricao: `Status alterado de "${statusAnterior}" para "${statusNovo}"`,
      detalhes: {
        statusAnterior,
        statusNovo,
        comentario: observacao
      }
    };
    
    setHistorico(prev => [historicoItem, ...prev]);
  };

  const addHistoricoEdicao = (camposAlterados: string[]) => {
    const historicoItem: HistoricoCompleto = {
      id: Date.now().toString(),
      solicitacaoId,
      tipo: 'edicao',
      usuario: 'Usuário Atual',
      data: new Date(),
      descricao: `Editou a solicitação`,
      detalhes: {
        camposAlterados
      }
    };
    
    setHistorico(prev => [historicoItem, ...prev]);
  };

  return {
    comentarios,
    historico,
    loading,
    addComentario,
    addHistoricoStatus,
    addHistoricoEdicao
  };
};