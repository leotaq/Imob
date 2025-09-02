import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Execucao {
  id: string;
  solicitacaoId: string;
  prestadorId: string;
  status: 'aprovada' | 'execucao' | 'concluida' | 'cancelada';
  dataInicio?: Date;
  dataFim?: Date;
  observacoes?: string;
  progresso: number;
  createdAt: Date;
  updatedAt: Date;
  solicitacao?: any;
  prestador?: any;
  orcamento?: any;
}

export const useExecucao = () => {
  const [execucoes, setExecucoes] = useState<Execucao[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { usuario } = useAuth();

  // Buscar execuções do Supabase
  const fetchExecucoes = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('execucoes')
        .select(`
          *,
          solicitacao:solicitacoes(*),
          prestador:usuarios(*),
          orcamento:orcamentos(*)
        `);
      
      // Aplicar filtros baseados no tipo de usuário
      if (usuario && !usuario.isMaster && !usuario.isAdmin) {
        if (usuario.prestador && typeof usuario.prestador === 'object') {
          // Prestador vê apenas suas execuções
          query = query.eq('prestadorId', usuario.id);
        } else {
          // Usuário comum vê execuções de suas solicitações
          query = query.in('solicitacaoId', 
            supabase.from('solicitacoes').select('id').eq('usuarioId', usuario.id)
          );
        }
      }
      
      const { data, error } = await query.order('createdAt', { ascending: false });
      
      if (error) throw error;
      
      setExecucoes(data?.map((exec: any) => ({
        ...exec,
        dataInicio: exec.dataInicio ? new Date(exec.dataInicio) : undefined,
        dataFim: exec.dataFim ? new Date(exec.dataFim) : undefined,
        createdAt: new Date(exec.createdAt),
        updatedAt: new Date(exec.updatedAt)
      })) || []);
    } catch (error) {
      console.error('Erro ao buscar execuções:', error);
      toast({
        title: 'Erro ao carregar execuções',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Criar nova execução
  const createExecucao = async (data: Partial<Execucao>) => {
    try {
      const { error } = await supabase
        .from('execucoes')
        .insert({
          solicitacaoId: data.solicitacaoId,
          prestadorId: data.prestadorId,
          status: data.status || 'aprovada',
          progresso: data.progresso || 0,
          observacoes: data.observacoes
        });
      
      if (error) throw error;
      
      await fetchExecucoes();
      
      toast({
        title: 'Execução criada!',
        description: 'A execução foi iniciada com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao criar execução:', error);
      toast({
        title: 'Erro ao criar execução',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Atualizar execução
  const updateExecucao = async (id: string, updates: Partial<Execucao>) => {
    try {
      const { error } = await supabase
        .from('execucoes')
        .update({
          ...updates,
          dataInicio: updates.dataInicio?.toISOString(),
          dataFim: updates.dataFim?.toISOString(),
          updatedAt: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchExecucoes();
      
      toast({
        title: 'Execução atualizada!',
        description: 'As informações foram salvas com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao atualizar execução:', error);
      toast({
        title: 'Erro ao atualizar execução',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Iniciar execução
  const iniciarExecucao = async (id: string) => {
    await updateExecucao(id, {
      status: 'execucao',
      dataInicio: new Date(),
      progresso: 25
    });
  };

  // Finalizar execução
  const finalizarExecucao = async (id: string, observacoes?: string) => {
    await updateExecucao(id, {
      status: 'concluida',
      dataFim: new Date(),
      progresso: 100,
      observacoes
    });
  };

  // Cancelar execução
  const cancelarExecucao = async (id: string, motivo?: string) => {
    await updateExecucao(id, {
      status: 'cancelada',
      observacoes: motivo
    });
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (usuario) {
      fetchExecucoes();
    }
  }, [usuario]);

  return {
    execucoes,
    loading,
    fetchExecucoes,
    createExecucao,
    updateExecucao,
    iniciarExecucao,
    finalizarExecucao,
    cancelarExecucao
  };
};