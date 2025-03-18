import { useMutation, useQueryClient } from '@tanstack/react-query';
import { processoService } from '../services/processoService';
import { Processo, ProcessoCreateInput } from '../types/processo';
import { useSnackbar } from './useSnackbar';

export function useDeleteProcesso(options?: {
  onSuccessCallback?: (id: string) => void;
  onErrorCallback?: (error: unknown) => void;
  queryInvalidation?: string[];
}) {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useSnackbar();

  const mutation = useMutation({
    mutationFn: (id: string) => processoService.delete(id),
    onSuccess: (_, id) => {
      // Invalidar queries
      if (options?.queryInvalidation) {
        options.queryInvalidation.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['processos'] });
      }

      showSuccess('Processo excluído com sucesso!');

      if (options?.onSuccessCallback) {
        options.onSuccessCallback(id);
      }
    },
    onError: (error) => {
      showError(`Erro ao excluir processo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      if (options?.onErrorCallback) {
        options.onErrorCallback(error);
      }
    }
  });

  return {
    mutation
  };
}

export function useCreateProcesso({ onSuccessCallback, onErrorCallback }: MutationCallbacks) {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (data: ProcessoCreateInput) => {      
      const processoData = {
        ...data,
        processoPaiId: data.processoPaiId
      };
      
      return processoService.create(processoData);
    },
    onSuccess: (data) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['processos'] });
      
      if (data.areaId) {
        queryClient.invalidateQueries({ queryKey: ['processos', data.areaId] });
      }
      
      if (data.processoPaiId || data.processoPaiId) {
        const processoPaiId = data.processoPaiId || data.processoPaiId;
        queryClient.invalidateQueries({ queryKey: ['processos', processoPaiId, 'subprocessos'] });
      }
      
      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
    onError: (error) => {
      console.error('Erro ao criar processo:', error);
      
      if (onErrorCallback) {
        onErrorCallback(error);
      }
    }
  });
  
  return { mutation };
}

export function useUpdateProcesso(options?: {
  onSuccessCallback?: (data: any) => void;
  onErrorCallback?: (error: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useSnackbar();

  const mutation = useMutation({
    mutationFn: (processoData: Processo) => processoService.update(processoData.id, processoData),
    onSuccess: (data, variables) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['processos'] });
      queryClient.invalidateQueries({ queryKey: ['processo', variables.id] });
      
      if (variables.areaId) {
        queryClient.invalidateQueries({ queryKey: ['processos', variables.areaId] });
      }
      
      if (variables.processoPaiId || variables.processoPaiId) {
        const processoPaiId = variables.processoPaiId || variables.processoPaiId;
        queryClient.invalidateQueries({ queryKey: ['processos', processoPaiId, 'subprocessos'] });
      }

      showSuccess('Processo atualizado com sucesso!');

      if (options?.onSuccessCallback) {
        options.onSuccessCallback(data);
      }
    },
    onError: (error) => {
      showError(`Erro ao atualizar processo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      if (options?.onErrorCallback) {
        options.onErrorCallback(error);
      }
    }
  });

  return {
    mutation
  };
}