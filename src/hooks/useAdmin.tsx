import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  isGestor?: boolean;
  isAdmin?: boolean;
  isMaster?: boolean;
  prestador?: boolean;
  empresaId?: string;
  createdAt?: string;
}

export interface Empresa {
  id: string;
  nome: string;
  usuarios?: Usuario[];
  createdAt?: string;
}

export const useAdmin = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { usuario } = useAuth();

  // Buscar todas as empresas
  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('empresas')
        .select(`
          *,
          usuarios:usuarios(*)
        `)
        .order('nome');
      
      if (error) throw error;
      setEmpresas(data || []);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      toast({
        title: 'Erro ao carregar empresas',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar todos os usuários
  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: 'Erro ao carregar usuários',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Atualizar usuário
  const updateUsuario = async (usuarioId: string, updates: Partial<Usuario>) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', usuarioId);
      
      if (error) throw error;
      
      // Recarregar dados
      await fetchUsuarios();
      await fetchEmpresas();
      
      toast({
        title: 'Usuário atualizado!',
        description: 'As informações foram salvas com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: 'Erro ao atualizar usuário',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Deletar usuário
  const deleteUsuario = async (usuarioId: string) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', usuarioId);
      
      if (error) throw error;
      
      // Recarregar dados
      await fetchUsuarios();
      await fetchEmpresas();
      
      toast({
        title: 'Usuário excluído!',
        description: 'O usuário foi removido com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      toast({
        title: 'Erro ao excluir usuário',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Criar nova empresa
  const createEmpresa = async (nome: string) => {
    try {
      const { error } = await supabase
        .from('empresas')
        .insert({ nome });
      
      if (error) throw error;
      
      // Recarregar dados
      await fetchEmpresas();
      
      toast({
        title: 'Empresa criada!',
        description: 'A nova empresa foi cadastrada com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      toast({
        title: 'Erro ao criar empresa',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Atualizar empresa
  const updateEmpresa = async (empresaId: string, updates: Partial<Empresa>) => {
    try {
      const { error } = await supabase
        .from('empresas')
        .update(updates)
        .eq('id', empresaId);
      
      if (error) throw error;
      
      // Recarregar dados
      await fetchEmpresas();
      
      toast({
        title: 'Empresa atualizada!',
        description: 'As informações foram salvas com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      toast({
        title: 'Erro ao atualizar empresa',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Deletar empresa
  const deleteEmpresa = async (empresaId: string) => {
    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', empresaId);
      
      if (error) throw error;
      
      // Recarregar dados
      await fetchEmpresas();
      
      toast({
        title: 'Empresa excluída!',
        description: 'A empresa foi removida com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao deletar empresa:', error);
      toast({
        title: 'Erro ao excluir empresa',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (usuario && (usuario.isAdmin || usuario.isMaster)) {
      fetchEmpresas();
      fetchUsuarios();
    }
  }, [usuario]);

  // Criar novo usuário
  const createUsuario = async (userData: Partial<Usuario> & { senha: string }) => {
    try {
      // Primeiro criar o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email!,
        password: userData.senha,
        email_confirm: true
      });
      
      if (authError) throw authError;
      
      // Depois criar o registro na tabela usuarios
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          id: authData.user.id,
          nome: userData.nome,
          email: userData.email,
          isGestor: userData.isGestor || false,
          empresaId: userData.empresaId
        });
      
      if (insertError) throw insertError;
      
      // Recarregar dados
      await fetchUsuarios();
      await fetchEmpresas();
      
      toast({
        title: 'Usuário criado!',
        description: 'O novo usuário foi cadastrado com sucesso.',
      });
      
      return authData.user;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: 'Erro ao criar usuário',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  return {
    empresas,
    usuarios,
    loading,
    fetchEmpresas,
    fetchUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa
  };
};