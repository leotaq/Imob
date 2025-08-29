import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useExport } from '@/hooks/useExport';
import type { Solicitacao } from '@/types';

interface ExportDialogProps {
  solicitacoes: Solicitacao[];
  children: React.ReactNode;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ solicitacoes, children }) => {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [filename, setFilename] = useState('');
  const [includeAttachments, setIncludeAttachments] = useState(false);
  const { exportSolicitacoes, isExporting } = useExport();

  const handleExport = async () => {
    await exportSolicitacoes(solicitacoes, {
      format,
      filename: filename || undefined,
      includeAttachments
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Relatório
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Formato de Exportação</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as 'csv' | 'pdf')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV (Excel)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  PDF
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filename" className="text-sm font-medium">
              Nome do Arquivo (opcional)
            </Label>
            <Input
              id="filename"
              placeholder="Ex: relatorio_solicitacoes"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Se não informado, será usado: solicitacoes_YYYY-MM-DD
            </p>
          </div>

          {format === 'pdf' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="attachments"
                checked={includeAttachments}
                onCheckedChange={(checked) => setIncludeAttachments(checked as boolean)}
              />
              <Label htmlFor="attachments" className="text-sm cursor-pointer">
                Incluir lista de anexos no relatório
              </Label>
            </div>
          )}

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Total de solicitações:</strong> {solicitacoes.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {format === 'csv' 
                ? 'O arquivo CSV pode ser aberto no Excel ou Google Sheets.'
                : 'O arquivo PDF será gerado para impressão ou visualização.'
              }
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? 'Exportando...' : 'Exportar'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isExporting}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};