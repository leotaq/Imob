const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

class FileManager {
  constructor(uploadsDir) {
    this.uploadsDir = uploadsDir;
  }

  // Obter informações do arquivo
  async getFileInfo(filename, tipo = 'geral') {
    try {
      const filePath = path.join(this.uploadsDir, tipo, filename);
      const stats = await fs.stat(filePath);
      
      return {
        filename,
        path: filePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        exists: true
      };
    } catch (error) {
      return { filename, exists: false };
    }
  }

  // Deletar arquivo
  async deleteFile(filename, tipo = 'geral') {
    try {
      const filePath = path.join(this.uploadsDir, tipo, filename);
      await fs.unlink(filePath);
      
      logger.info('Arquivo deletado', { filename, tipo });
      return true;
    } catch (error) {
      logger.logError('Erro ao deletar arquivo', error, { filename, tipo });
      return false;
    }
  }

  // Listar arquivos de um diretório
  async listFiles(tipo = 'geral') {
    try {
      const dirPath = path.join(this.uploadsDir, tipo);
      const files = await fs.readdir(dirPath);
      
      const fileInfos = await Promise.all(
        files.map(async (filename) => {
          const info = await this.getFileInfo(filename, tipo);
          return info;
        })
      );
      
      return fileInfos.filter(info => info.exists);
    } catch (error) {
      logger.logError('Erro ao listar arquivos', error, { tipo });
      return [];
    }
  }

  // Mover arquivo
  async moveFile(filename, fromTipo, toTipo) {
    try {
      const fromPath = path.join(this.uploadsDir, fromTipo, filename);
      const toPath = path.join(this.uploadsDir, toTipo, filename);
      
      // Criar diretório de destino se não existir
      const toDir = path.dirname(toPath);
      await fs.mkdir(toDir, { recursive: true });
      
      await fs.rename(fromPath, toPath);
      
      logger.info('Arquivo movido', { filename, fromTipo, toTipo });
      return true;
    } catch (error) {
      logger.logError('Erro ao mover arquivo', error, { filename, fromTipo, toTipo });
      return false;
    }
  }

  // Obter URL pública do arquivo
  getPublicUrl(filename, tipo = 'geral') {
    return `/api/files/${tipo}/${filename}`;
  }

  // Validar se arquivo existe
  async fileExists(filename, tipo = 'geral') {
    const info = await this.getFileInfo(filename, tipo);
    return info.exists;
  }
}

module.exports = FileManager;