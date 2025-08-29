import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, BarChart3, Building2, Calculator } from 'lucide-react';

interface OrcamentosStatsProps {
  statistics: {
    total: number;
    aprovados: number;
    pendentes: number;
    valorTotal: number;
  };
}

export const OrcamentosStats: React.FC<OrcamentosStatsProps> = ({ statistics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 border-blue-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-blue-700 font-semibold uppercase tracking-wide">Total de Orçamentos</p>
              <p className="text-3xl font-bold text-blue-900">{statistics.total}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <FileText className="h-6 w-6 text-blue-700" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 via-green-100 to-green-200 border-green-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-green-700 font-semibold uppercase tracking-wide">Aprovados</p>
              <p className="text-3xl font-bold text-green-900">{statistics.aprovados}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <BarChart3 className="h-6 w-6 text-green-700" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 border-yellow-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-yellow-700 font-semibold uppercase tracking-wide">Pendentes</p>
              <p className="text-3xl font-bold text-yellow-900">{statistics.pendentes}</p>
            </div>
            <div className="p-3 bg-yellow-200 rounded-full">
              <Building2 className="h-6 w-6 text-yellow-700" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 border-purple-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-purple-700 font-semibold uppercase tracking-wide">Valor Total</p>
              <p className="text-3xl font-bold text-purple-900">R$ {statistics.valorTotal.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-full">
              <Calculator className="h-6 w-6 text-purple-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};