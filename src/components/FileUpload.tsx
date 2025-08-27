import React, { useRef } from 'react';
import { Upload, X, File, Image } from 'lucide-react';
import { Button } from './ui/button';
import { useFileUpload } from '../hooks/useFileUpload';

interface FileUploadProps {
  tipo: string;
  entityId?: string;
  entityType?: string;
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  onFilesChange?: (files: any[]) => void;
}

export function FileUpload({
  tipo,
  entityId,
  entityType,
  maxFiles = 5,
  maxSize = 10,
  accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt",
  onFilesChange
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, files, uploadFiles, deleteFile, loadFiles } = useFileUpload({
    tipo,
    entityId,
    entityType,
    maxFiles,
    maxSize
  });

  React.useEffect(() => {
    loadFiles();
  }, []);

  React.useEffect(() => {
    onFilesChange?.(files);
  }, [files, onFilesChange]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      await uploadFiles(fileList);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const fileList = event.dataTransfer.files;
    if (fileList) {
      await uploadFiles(fileList);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (mimetype: string) => mimetype.startsWith('image/');

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          Arraste arquivos aqui ou clique para selecionar
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Máximo {maxFiles} arquivos, {maxSize}MB cada
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Enviando...' : 'Selecionar Arquivos'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Arquivos Anexados ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.filename}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {isImage(file.mimetype) ? (
                    <Image className="h-5 w-5 text-blue-500" />
                  ) : (
                    <File className="h-5 w-5 text-gray-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium truncate max-w-xs">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    Ver
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFile(file.filename)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}