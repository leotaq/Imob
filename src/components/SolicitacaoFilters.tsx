import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { SolicitacaoFilters } from '@/hooks/useSolicitacoes';

interface SolicitacaoFiltersProps {
  filters: SolicitacaoFilters;
  onFiltersChange: (filters: SolicitacaoFilters) => void;
  totalCount: number;
  filteredCount: number;
}

const SolicitacaoFiltersComponent: React.FC<SolicitacaoFiltersProps> = ({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount
}) => {
  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'todas',
      tipoManutencao: 'todos',
      tipoSolicitante: 'todos',
      prioridade: 'todas'
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.status !== 'todas' || 
    filters.tipoManutencao !== 'todos' || 
    filters.tipoSolicitante !== 'todos' ||
    filters.prioridade !== 'todas';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Mostrando {filteredCount} de {totalCount} solicitações</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              Filtros ativos
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, tipo, endereço ou ID..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Filtros em Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label className="text-sm font-medium">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="aberta">Aberta</SelectItem>
                <SelectItem value="orcamento">Orçamento</SelectItem>
                <SelectItem value="aprovada">Aprovada</SelectItem>
                <SelectItem value="execucao">Em Execução</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Tipo de Manutenção</Label>
            <Select
              value={filters.tipoManutencao}
              onValueChange={(value) => onFiltersChange({ ...filters, tipoManutencao: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Elétrica">Elétrica</SelectItem>
                <SelectItem value="Hidráulica">Hidráulica</SelectItem>
                <SelectItem value="Pintura">Pintura</SelectItem>
                <SelectItem value="Limpeza">Limpeza</SelectItem>
                <SelectItem value="Jardinagem">Jardinagem</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Solicitante</Label>
            <Select
              value={filters.tipoSolicitante}
              onValueChange={(value) => onFiltersChange({ ...filters, tipoSolicitante: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="inquilino">Inquilino</SelectItem>
                <SelectItem value="proprietario">Proprietário</SelectItem>
                <SelectItem value="imobiliaria">Imobiliária</SelectItem>
                <SelectItem value="terceiros">Terceiros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Prioridade</Label>
            <Select
              value={filters.prioridade}
              onValueChange={(value) => onFiltersChange({ ...filters, prioridade: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SolicitacaoFiltersComponent;