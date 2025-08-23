import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  ClipboardList, 
  DollarSign, 
  Settings, 
  Users,
  Wrench,
  BarChart3
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Solicitações', href: '/solicitacoes', icon: ClipboardList },
  { name: 'Orçamentos', href: '/orcamentos', icon: DollarSign },
  { name: 'Execução', href: '/execucao', icon: Wrench },
  { name: 'Prestadores', href: '/prestadores', icon: Users },
  { name: 'Financeiro', href: '/financeiro', icon: BarChart3 },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-primary">ManutFácil</h1>
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
              <item.icon 
                className={cn(
                  'mr-3 h-5 w-5 transition-colors',
                  isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground'
                )} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center">
            <Settings className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="text-sm text-sidebar-foreground">
            Sistema v1.0
          </div>
        </div>
      </div>
    </div>
  );
};