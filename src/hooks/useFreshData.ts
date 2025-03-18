import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useFreshData(
  queryKey: string | string[], 
  refetch: () => void,
  pathPattern?: string
) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Invalidar e recarregar dados ao montar
    queryClient.invalidateQueries({ 
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] 
    });
    refetch();
    
    // Adicionar listener para recarregar dados em navegação
    const handleRouteChange = () => {
      const currentPath = window.location.pathname;
      if (!pathPattern || currentPath.includes(pathPattern)) {
        refetch();
      }
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [queryClient, refetch, queryKey, pathPattern]);
}