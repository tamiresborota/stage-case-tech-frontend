import api from './api';
import { Processo, ProcessoInput, ProcessoDetalhes } from '../types/processo';
import { processoFromApi } from '../utils/adapters';
import { convertTipoToNumber, convertStatusToNumber } from '../utils/enumUtils';
import { TipoProcesso, StatusProcesso } from '../types/enums';

export const processoService = {

  getAll: async (): Promise<Processo[]> => {
    const response = await api.get('/processos');
    return response.data.map(processoFromApi);
  },

  getByArea: async (areaId: string): Promise<Processo[]> => {
    const response = await api.get(`/areas/${areaId}/processos`);
    return response.data.map(processoFromApi);
  },

  getMainByArea: async (areaId: string): Promise<Processo[]> => {
    const response = await api.get(`/areas/${areaId}/processos/`);
    return response.data.map(processoFromApi);
  },

  getSubprocessos: async (processoId: string): Promise<Processo[]> => {
    try {
      const response = await api.get(`/processos/${processoId}/subprocessos`);
      return response.data.map(processoFromApi);
    } catch (error) {
      console.error(`Erro ao buscar subprocessos:`, error);
      
      try {
        const todosProcessos = await processoService.getAll();
        const subprocessos = todosProcessos.filter(p => p.processoId === processoId);
        return subprocessos;
      } catch (fallbackError) {
        console.error(`Método alternativo também falhou:`, fallbackError);
        return [];
      }
    }
  },

  getById: async (id: string): Promise<Processo> => {
    const response = await api.get(`/processos/${id}`);
    return processoFromApi(response.data);
  },

  getDetalhes: async (id: string): Promise<ProcessoDetalhes> => {
    const response = await api.get(`/processos/${id}/detalhes`);
    return response.data;
  },

  create: async (processoData: ProcessoInput): Promise<Processo> => {
    try {
      const { 
        nome, 
        descricao, 
        tipo, 
        status, 
        areaId, 
        processoPaiId, 
        responsaveis, 
        ferramentas, 
        documentos 
      } = processoData;


      const apiData = {
        nome,
        descricao,
        tipo: typeof tipo === 'string' 
          ? convertTipoToNumber(tipo as TipoProcesso)
          : tipo,
        status: typeof status === 'string'
          ? convertStatusToNumber(status as StatusProcesso)
          : status,
        areaId,
        processoPaiId,
      };
      
      
      const response = await api.post('/processos', apiData);
      const novoProcesso = processoFromApi(response.data);
      const processoId = novoProcesso.id;
      
      
      if (responsaveis && responsaveis.length > 0) {
        const respArray = typeof responsaveis === 'string' 
          ? responsaveis.split(',').map(r => r.trim()) 
          : responsaveis;
          
        for (const respNome of respArray) {
          if (respNome.trim()) {
            await api.post(`/processos/${processoId}/detalhes/responsaveis`, { nome: respNome.trim() });
          }
        }
      }
      
      if (ferramentas && ferramentas.length > 0) {
        for (const sistNome of ferramentas) {
          if (sistNome.trim()) {
            await api.post(`/processos/${processoId}/detalhes/ferramentas`, { 
              nome: sistNome.trim(),
              descricao: ''
            });
          }
        }
      }
      
      if (documentos && documentos.length > 0) {
        for (const docNome of documentos) {
          if (docNome.trim()) {
            await api.post(`/processos/${processoId}/detalhes/documentos`, { 
              nome: docNome.trim(),
              descricao: ''
            });
          }
        }
      }
      
      const processoCompleto = await processoService.getById(processoId);
      
      return processoCompleto;
    } catch (error) {
      console.error('Erro durante a criação do processo:', error);
      throw error;
    }
  },

  update: async (id: string, processoData: Partial<Processo>): Promise<Processo> => {
    try {

      if (!processoData) {
        throw new Error('Dados do processo não fornecidos.');
      }

      const { nome, descricao, tipo, status } = processoData;
      if (!nome || !descricao || !tipo || !status) {
        throw new Error('Dados incompletos para atualização.');
      }

      const dadosBasicos = {
        nome: processoData.nome,
        descricao: processoData.descricao,
        tipo: typeof processoData.tipo === 'string' 
          ? convertTipoToNumber(processoData.tipo as TipoProcesso)
          : processoData.tipo,
        status: typeof processoData.status === 'string'
          ? convertStatusToNumber(processoData.status as StatusProcesso)
          : processoData.status,
        processoPaiId: processoData.processoPaiId
      };
      
      const response = await api.put(`/processos/${id}`, dadosBasicos);

      const detalhesAtuais = await api.get(`/processos/${id}/detalhes`);
      const processoDetalhes = detalhesAtuais.data;

      if (processoData.responsaveis && processoData.responsaveis.length > 0) {
        
        // Se temos IDs existentes, fazemos update, caso contrário adicionamos novos
        if (processoDetalhes.responsaveis && processoDetalhes.responsaveis.length > 0) {
          // Remove responsáveis existentes
          for (const resp of processoDetalhes.responsaveis) {
            await api.delete(`/processos/${id}/detalhes/responsaveis/${resp.id}`);
          }
        }
        
        // Adiciona novos responsáveis
        for (const respNome of processoData.responsaveis) {
          if (respNome.trim()) {
            await api.post(`/processos/${id}/detalhes/responsaveis`, { nome: respNome.trim() });
          }
        }
      }

      if (processoData.ferramentas && processoData.ferramentas.length > 0) {
        
        // Remove ferramentas existentes
        if (processoDetalhes.ferramentas && processoDetalhes.ferramentas.length > 0) {
          for (const ferr of processoDetalhes.ferramentas) {
            await api.delete(`/processos/${id}/detalhes/ferramentas/${ferr.id}`);
          }
        }
        
        // Adiciona novas ferramentas
        for (const sistNome of processoData.ferramentas) {
          if (sistNome.trim()) {
            await api.post(`/processos/${id}/detalhes/ferramentas`, { 
              nome: sistNome.trim(), 
              descricao: '' 
            });
          }
        }
      }

      if (processoData.documentos && processoData.documentos.length > 0) {
        
        // Remove documentos existentes
        if (processoDetalhes.documentos && processoDetalhes.documentos.length > 0) {
          for (const doc of processoDetalhes.documentos) {
            await api.delete(`/processos/${id}/detalhes/documentos/${doc.id}`);
          }
        }
        
        // Adiciona novos documentos
        for (const docNome of processoData.documentos) {
          if (docNome.trim()) {
            await api.post(`/processos/${id}/detalhes/documentos`, { 
              nome: docNome.trim(), 
              descricao: '' 
            });
          }
        }
      }

      const processoAtualizado = await processoService.getById(id);      
      return processoAtualizado;
    } catch (error) {
      console.error('Erro durante a atualização do processo:', error);
      throw error;
    }
  },


  delete: async (id: string): Promise<void> => {
    await api.delete(`/processos/${id}`);
  },


  getHierarquia: async (id: string) => {
    const { data } = await api.get(`/processos/${id}/hierarquia`);
    
    const mapHierarquia = (item: any) => {
      const processo = processoFromApi(item);
      if (item.subProcessos && Array.isArray(item.subProcessos)) {
        return {
          ...processo,
          subProcessos: item.subProcessos.map(mapHierarquia)
        };
      }
      return processo;
    };
    
    return mapHierarquia(data);
  }
};