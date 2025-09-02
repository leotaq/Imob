import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useViewMode } from '../hooks/useViewMode';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardList,
  DollarSign,
  Settings,
  Users,
  Wrench,
  BarChart3,
  Plus
} from 'lucide-react';


const getNavigationForViewMode = (viewMode: string, usuario: any) => {
  const allPages = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, key: 'dashboard' },
    { name: 'Nova Solicitação', href: '/solicitacao-inquilino', icon: Plus, key: 'nova_solicitacao' },
    { name: 'Solicitações', href: '/solicitacoes', icon: ClipboardList, key: 'solicitacoes' },
    { name: 'Orçamentos', href: '/orcamentos', icon: DollarSign, key: 'orcamentos' },
    { name: 'Execução', href: '/execucao', icon: Wrench, key: 'execucao' },
    { name: 'Prestadores', href: '/prestadores', icon: Users, key: 'prestadores' },
    { name: 'Financeiro', href: '/financeiro', icon: BarChart3, key: 'financeiro' },
  ];

  // Master: acesso a tudo
  if (viewMode === 'master') {
    return allPages;
  }

  // Prestador: apenas orçamentos e execução (SEMPRE, independente de permissões)
  if (viewMode === 'prestador') {
    return [
      { name: 'Orçamentos', href: '/orcamentos', icon: DollarSign, key: 'orcamentos' },
      { name: 'Execução', href: '/execucao', icon: Wrench, key: 'execucao' },
    ];
  }

  // Gestor: páginas específicas definidas
  if (viewMode === 'gestor') {
    // Páginas padrão para gestores: nova solicitação, solicitações, orçamentos, execução e prestadores
    const gestorNavigation = [
      { name: 'Nova Solicitação', href: '/solicitacao-inquilino', icon: Plus, key: 'nova_solicitacao' },
      { name: 'Solicitações', href: '/solicitacoes', icon: ClipboardList, key: 'solicitacoes' },
      { name: 'Orçamentos', href: '/orcamentos', icon: DollarSign, key: 'orcamentos' },
      { name: 'Execução', href: '/execucao', icon: Wrench, key: 'execucao' },
      { name: 'Prestadores', href: '/prestadores', icon: Users, key: 'prestadores' },
    ];
    
    // Se o usuário tem permissões específicas configuradas, usar elas
    if (usuario?.permissoes && Array.isArray(usuario.permissoes) && usuario.permissoes.length > 0) {
      return allPages.filter(page => usuario.permissoes.includes(page.key));
    }
    
    // Caso contrário, usar permissões padrão do gestor
    return gestorNavigation;
  }

  // Usuário comum: apenas nova solicitação
  return [
    { name: 'Nova Solicitação', href: '/solicitacao-inquilino', icon: Plus, key: 'nova_solicitacao' },
  ];
};

export const Sidebar = () => {
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const { viewMode } = useViewMode();

  const navigation = getNavigationForViewMode(viewMode, usuario);

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex flex-col items-center justify-center h-56 px-6 border-b border-sidebar-border">
        <div className="flex flex-col items-center w-full">
          <img src="/logo-imobigestor.png" alt="ImobiGestor Logo" style={{maxHeight: 160, maxWidth: 160, objectFit: 'contain', display: 'block'}} />
          {usuario && (
            <span className="text-lg font-semibold text-sidebar-primary mt-4 truncate w-full text-center">
              Usuário: {usuario.nome || usuario.email || 'Usuário'}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary'
              )}
            >
              <item.icon className="mr-2 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
        {viewMode === 'master' && (
          <>
            <Link
              to="/admin"
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                location.pathname === '/admin'
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary'
              )}
            >
              <Settings className="mr-2 h-5 w-5" />
              Administração
            </Link>
            <Link
              to="/configuracao-permissoes"
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                location.pathname === '/configuracao-permissoes'
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary'
              )}
            >
              <Users className="mr-2 h-5 w-5" />
              Permissões
            </Link>
          </>
        )}
      </nav>
      {/* Botão de logout no rodapé */}
      <div className="w-full flex justify-center mb-6">
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors shadow"
        >
          Sair
        </button>
      </div>
    </div>
  );
};