import api from './api';
import { Processo } from '../types/processo';
import { Area } from '../types/area';

export const areaService = {
  getAll: async (): Promise<Area[]> => {
    try {
      const response = await api.get('/areas');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar áreas:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Area> => {
    try {
      const response = await api.get(`/areas/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro na requisição da área:", error);
      throw error;
    }
  },

  getProcessos: async (areaId: string): Promise<Processo[]> => {
    try {
      const response = await api.get(`/areas/${areaId}/processos`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar processos da área ${areaId}:`, error);
      throw error;
    }
  },

  create: async (area: Omit<Area, 'id'>): Promise<Area> => {
    try {
      const response = await api.post('/areas', area);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar área:', error);
      throw error;
    }
  },

  update: async (area: Area): Promise<Area> => {
    try {
      const response = await api.put(`/areas/${area.id}`, area);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar área ${area.id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/areas/${id}`);
    } catch (error) {
      console.error(`Erro ao excluir área ${id}:`, error);
      throw error;
    }
  }
};