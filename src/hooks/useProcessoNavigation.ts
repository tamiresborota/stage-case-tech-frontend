import { useNavigate } from 'react-router-dom';

export function useProcessoNavigation() {
  const navigate = useNavigate();
  
  return {
    goToListaProcessos: () => navigate('/processos/lista'),
    goToHierarquiaProcessos: () => navigate('/processos/hierarquia'),
    goToTodosProcessos: () => navigate('/processos/todos'),
    
    goToProcessosArea: (areaId: string | number) => navigate(`/areas/${areaId}/processos`),
    goToNovoProcesso: (areaId?: string) => {
      if (areaId) {
        navigate(`/areas/${areaId}/processo-tipo`);
      } else {
        navigate('/processos/novo');
      }
    },
    goToDetalheProcesso: (id: string | number) => navigate(`/processos/${id}/detalhe`),
    goToEditarProcesso: (id: string | number) => navigate(`/processos/${id}/editar`),
    goToSubprocessos: (processoId: string | number) => navigate(`/processos/${processoId}/subprocessos`),
    goToNovoSubprocesso: (processoPaiId: string | number) => navigate(`/processos/${processoPaiId}/subprocessos/novo`),
    
    goBack: () => navigate(-1),
    
    goBackToProcessContext: (processo: { 
      processoPaiId?: string | number | null, 
      processoPaiId?: string | number | null, 
      areaId?: string | number 
    }) => {
      const processoPaiId = processo.processoPaiId || processo.processoPaiId;
      if (processoPaiId) {
        navigate(`/processos/${processoPaiId}/subprocessos`);
      } else if (processo.areaId) {
        navigate(`/areas/${processo.areaId}/processos`);
      } else {
        navigate('/processos/todos');
      }
    }
  };
}