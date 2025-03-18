import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useQueryInvalidation(queryKeys: string[] | string[][]) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Invalidar todas as queries especificadas
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ 
        queryKey: Array.isArray(key) ? key : [key] 
      });
    });
  }, [queryClient]);
}