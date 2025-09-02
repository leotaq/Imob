import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export type ViewMode = 'usuario' | 'prestador' | 'gestor' | 'master';

export function useViewMode() {
  const { usuario } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('usuario');

  // Atualiza o viewMode quando o usuário carrega
  useEffect(() => {
    if (usuario) {
      // Determina o viewMode correto baseado no tipo de usuário
      let viewModeCorreto: ViewMode;
      if (usuario.isMaster) {
        viewModeCorreto = 'master';
      } else if (usuario.isGestor) {
        viewModeCorreto = 'gestor';
      } else if (usuario.prestador && typeof usuario.prestador === 'object') {
        viewModeCorreto = 'prestador';
      } else {
        viewModeCorreto = 'usuario';
      }
      
      // Define o viewMode correto
      setViewMode(viewModeCorreto);
    }
  }, [usuario]);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  const canSwitchToMode = (mode: ViewMode): boolean => {
    if (!usuario) return false;
    
    // Master pode ver todas as visualizações
    if (usuario.isMaster) return true;
    
    // Gestor pode ver usuário e gestor (mas não master)
    if (usuario.isGestor && (mode === 'usuario' || mode === 'gestor')) return true;
    
    // Prestador pode ver usuário e prestador (mas não gestor nem master)
    if (usuario.prestador && typeof usuario.prestador === 'object' && (mode === 'usuario' || mode === 'prestador')) return true;
    
    // Usuário comum só pode ver modo usuário
    if (mode === 'usuario') return true;
    
    return false;
  };

  const switchViewMode = (mode: ViewMode) => {
    if (canSwitchToMode(mode)) {
      setViewMode(mode);
    }
  };

  const getAvailableModes = (): ViewMode[] => {
    const modes: ViewMode[] = [];
    
    if (canSwitchToMode('master')) modes.push('master');
    if (canSwitchToMode('gestor')) modes.push('gestor');
    if (canSwitchToMode('prestador')) modes.push('prestador');
    if (canSwitchToMode('usuario')) modes.push('usuario');
    
    return modes;
  };

  const getModeLabel = (mode: ViewMode): string => {
    switch (mode) {
      case 'master': return '👑 Master';
      case 'gestor': return '👔 Gestor';
      case 'prestador': return '🔧 Prestador';
      case 'usuario': return '👤 Usuário';
      default: return mode;
    }
  };

  return {
    viewMode,
    switchViewMode,
    canSwitchToMode,
    getAvailableModes,
    getModeLabel
  };
}