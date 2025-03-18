import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { processoService } from '../services/processoService';
import { Processo, ProcessoDetalhes, ProcessoCreateInput} from '../types/processo';

export function useProcessos(options: UseQueryOptions<Processo[], unknown, Processo[], string[]> = {}) {
  return useQuery({
    queryKey: ['processos'],
    queryFn: processoService.getAll,
    ...options
  });
}

export function useProcessoDetalhes(
  processoId: string | undefined,
  options: UseQueryOptions<Processo, unknown, Processo, string[]> = {}
) {
  return useQuery({
    queryKey: ['processo', processoId],
    queryFn: () => processoId ? processoService.getById(processoId) : Promise.reject('ID do processo não fornecido'),
    enabled: !!processoId,
    ...options
  });
}

export function useProcessoDetalhesCompletos(
  processoId: string | undefined,
  options: UseQueryOptions<ProcessoDetalhes, unknown, ProcessoDetalhes, string[]> = {}
) {
  return useQuery({
    queryKey: ['processo', processoId, 'detalhes'],
    queryFn: () => processoId ? processoService.getDetalhes(processoId) : Promise.reject('ID do processo não fornecido'),
    enabled: !!processoId,
    ...options
  });
}

export function useProcessosPorArea(areaId: string) {
  const query = useQuery({
    queryKey: ['processos', areaId],
    queryFn: () => areaId ? processoService.getByArea(areaId) : Promise.reject('ID da área não fornecido'),
    enabled: !!areaId,
    staleTime: 0,
    refetchOnMount: 'always'
  });
  
  return query;
}

export function useSubprocessos(processoId: string) {
  const query = useQuery({
    queryKey: ['processos', processoId, 'subprocessos'],
    queryFn: () => processoId ? processoService.getSubprocessos(processoId) : Promise.reject('ID do processo não fornecido'),
    enabled: !!processoId,
    staleTime: 0,
    refetchOnMount: 'always'
  });
  
  return query;
}

export function useProcessoHierarquia(
  processoId: string | undefined,
  options: UseQueryOptions<any, unknown, any, string[]> = {}
) {
  return useQuery({
    queryKey: ['processo', processoId, 'hierarquia'],
    queryFn: () => processoId ? processoService.getHierarquia(processoId) : Promise.reject('ID do processo não fornecido'),
    enabled: !!processoId,
    ...options
  });
}