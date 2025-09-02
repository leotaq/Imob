import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface UsuarioPermissoes {
  id: string;
  nome: string;
  email: string;
  isGestor: boolean;
  permissoes: string[];
  empresaId: string;
}

export interface EmpresaPermissoes {
  id: string;
  nome: string;
  usuarios: UsuarioPermissoes[];
}

export const PAGINAS_DISPONIVEIS = [
  { key: 'dashboard', nome: 'Dashboard', descricao: 'Visão geral do sistema' },
  { key: 'nova_solicitacao', nome: 'Nova Solicitação', descricao: 'Criar novas solicitações' },
  { key: 'solicitacoes', nome: 'Solicitações', descricao: 'Gerenciar solicitações' },
  { key: 'orcamentos', nome: 'Orçamentos', descricao: 'Gerenciar orçamentos' },
  { key: 'execucao', nome: 'Execução', descricao: 'Acompanhar execução de serviços' },
  { key: 'prestadores', nome: 'Prestadores', descricao: 'Gerenciar prestadores de serviço' },
  { key: 'financeiro', nome: 'Financeiro', descricao: 'Relatórios e controle financeiro' },
];

export const usePermissoes = () => {
  const [empresas, setEmpresas] = useState<EmpresaPermissoes[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { usuario } = useAuth();

  // Buscar empresas e usuários com permissões
  const fetchEmpresasPermissoes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('empresas')
        .select(`
          *,
          usuarios:usuarios(
            id,
            nome,
            email,
            isGestor,
            empresaId,
            permissoes:user_permissions(
              permissao
            )
          )
        `)
        .order('nome');
      
      if (error) throw error;
      
      // Transformar dados para o formato esperado
      const empresasFormatadas = data?.map((empresa: any) => ({
        id: empresa.id,
        nome: empresa.nome,
        usuarios: empresa.usuarios?.map((user: any) => ({
          id: user.id,
          nome: user.nome,
          email: user.email,
          isGestor: user.isGestor,
          empresaId: user.empresaId,
          permissoes: user.permissoes?.map((p: any) => p.permissao) || []
        })) || []
      })) || [];
      
      setEmpresas(empresasFormatadas);
    } catch (error) {
      console.error('Erro ao buscar empresas e permissões:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Atualizar permissões de um usuário
  const updatePermissoes = async (usuarioId: string, permissoes: string[]) => {
    try {
      // Primeiro, remover todas as permissões existentes
      const { error: deleteError } = await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', usuarioId);
      
      if (deleteError) throw deleteError;
      
      // Depois, inserir as novas permissões
      if (permissoes.length > 0) {
        const permissoesData = permissoes.map(permissao => ({
          user_id: usuarioId,
          permissao
        }));
        
        const { error: insertError } = await supabase
          .from('user_permissions')
          .insert(permissoesData);
        
        if (insertError) throw insertError;
      }
      
      // Recarregar dados
      await fetchEmpresasPermissoes();
      
      toast({
        title: 'Permissões atualizadas!',
        description: 'As permissões foram salvas com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      toast({
        title: 'Erro ao atualizar permissões',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Verificar se um usuário tem uma permissão específica
  const hasPermission = (usuarioId: string, permissao: string): boolean => {
    for (const empresa of empresas) {
      const usuario = empresa.usuarios.find(u => u.id === usuarioId);
      if (usuario && usuario.permissoes.includes(permissao)) {
        return true;
      }
    }
    return false;
  };

  // Obter todas as permissões de um usuário
  const getUserPermissions = (usuarioId: string): string[] => {
    for (const empresa of empresas) {
      const usuario = empresa.usuarios.find(u => u.id === usuarioId);
      if (usuario) {
        return usuario.permissoes;
      }
    }
    return [];
  };

  // Carregar dados iniciais (apenas para usuários master)
  useEffect(() => {
    if (usuario && usuario.isMaster) {
      fetchEmpresasPermissoes();
    }
  }, [usuario]);

  return {
    empresas,
    loading,
    fetchEmpresasPermissoes,
    updatePermissoes,
    hasPermission,
    getUserPermissions,
    paginasDisponiveis: PAGINAS_DISPONIVEIS
  };
};