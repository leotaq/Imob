import { useState } from 'react';
import { useToast } from './use-toast';

interface UploadedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}

interface UseFileUploadOptions {
  tipo: string;
  entityId?: string;
  entityType?: string;
  maxFiles?: number;
  maxSize?: number; // em MB
}

export function useFileUpload(options: UseFileUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const uploadFiles = async (fileList: FileList) => {
    if (!fileList || fileList.length === 0) return;

    const maxFiles = options.maxFiles || 5;
    const maxSize = (options.maxSize || 10) * 1024 * 1024; // Converter MB para bytes

    // Validações
    if (fileList.length > maxFiles) {
      toast({
        title: "Muitos arquivos",
        description: `Máximo de ${maxFiles} arquivos permitidos`,
        variant: "destructive"
      });
      return;
    }

    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: `${fileList[i].name} excede o tamanho máximo de ${options.maxSize || 10}MB`,
          variant: "destructive"
        });
        return;
      }
    }

    setUploading(true);

    try {
      const formData = new FormData();
      
      for (let i = 0; i < fileList.length; i++) {
        formData.append('files', fileList[i]);
      }

      if (options.entityId) formData.append('entityId', options.entityId);
      if (options.entityType) formData.append('entityType', options.entityType);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/upload/${options.tipo}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Erro no upload';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } catch {
            // Se falhar ao fazer parse, usa mensagem padrão
          }
        }
        
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        setFiles(prev => [...prev, ...(result.files || [])]);
        
        toast({
          title: "Upload realizado",
          description: `${result.files?.length || 0} arquivo(s) enviado(s) com sucesso`
        });
        
        return result.files;
      } else {
         throw new Error('Resposta do servidor não é JSON válido');
       }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (filename: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/files/${options.tipo}/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Erro ao deletar arquivo';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } catch {
            // Se falhar ao fazer parse, usa mensagem padrão
          }
        }
        
        throw new Error(errorMessage);
      }

      setFiles(prev => prev.filter(f => f.filename !== filename));
      
      toast({
        title: "Arquivo deletado",
        description: "Arquivo removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      toast({
        title: "Erro ao deletar",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    }
  };

  const loadFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/files/${options.tipo}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          setFiles(result.files || []);
        } else {
          console.warn('Resposta não é JSON válido');
          setFiles([]);
        }
      } else {
        // Se a resposta não for ok, não tenta fazer parse JSON
        console.warn(`Erro ao carregar arquivos: ${response.status}`);
        setFiles([]);
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      setFiles([]);
    }
  };

  return {
    uploading,
    files,
    uploadFiles,
    deleteFile,
    loadFiles,
    setFiles
  };
}