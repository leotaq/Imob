import { useViewMode, ViewMode } from '../hooks/useViewMode';
import { useAuth } from '../hooks/useAuth';

export const ViewModeSelector = () => {
  const { viewMode, switchViewMode, getAvailableModes, getModeLabel } = useViewMode();
  const { usuario } = useAuth();
  const availableModes = getAvailableModes();

  // Se só tem um modo disponível, não mostra o seletor
  if (availableModes.length <= 1) {
    return null;
  }

  // Para prestadores, não mostra o seletor - eles devem usar apenas o modo prestador
  if (usuario?.prestador && typeof usuario.prestador === 'object' && !usuario?.isMaster && !usuario?.isGestor) {
    return null;
  }

  return (
    <div className="flex gap-1 mb-4">
      <span className="text-xs text-muted-foreground self-center mr-2">Visualizar como:</span>
      {availableModes.map((mode) => (
        <button
          key={mode}
          onClick={() => switchViewMode(mode)}
          className={`px-2 py-1 rounded text-xs transition-colors ${
            viewMode === mode
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
          title={`Alternar para visualização de ${mode}`}
        >
          {getModeLabel(mode)}
        </button>
      ))}
    </div>
  );
};