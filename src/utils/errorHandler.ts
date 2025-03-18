interface ApiError {
    message: string;
    status?: number;
    isApiError: boolean;
  }
  
 
  export const formatApiError = (error: any): ApiError => {
    if (error && error.isApiError) {
      return error;
    }
  
    const formattedError: ApiError = {
      message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
      isApiError: true
    };
  
    if (!error) {
      return formattedError;
    }
  
    if (error.response) {
      formattedError.status = error.response.status;
      
      switch (error.response.status) {
        case 400:
          formattedError.message = 'Requisição inválida. Verifique os dados enviados.';
          break;
        case 401:
          formattedError.message = 'Não autorizado. Faça login novamente.';
          break;
        case 403:
          formattedError.message = 'Acesso proibido. Você não tem permissão para esta ação.';
          break;
        case 404:
          formattedError.message = 'Recurso não encontrado.';
          break;
        case 409:
          formattedError.message = 'Conflito de dados. O recurso pode já existir.';
          break;
        case 422:
          formattedError.message = 'Dados inválidos. Verifique as informações fornecidas.';
          break;
        case 500:
          formattedError.message = 'Erro interno do servidor. Tente novamente mais tarde.';
          break;
        default:
          formattedError.message = `Erro do servidor: ${error.response.status}`;
          
          // Tenta extrair uma mensagem mais específica da resposta
          if (error.response.data && typeof error.response.data === 'object') {
            if (error.response.data.message) {
              formattedError.message += ` - ${error.response.data.message}`;
            } else if (error.response.data.error) {
              formattedError.message += ` - ${error.response.data.error}`;
            }
          }
      }
    } else if (error.request) {
      formattedError.message = 'Sem resposta do servidor. Verifique sua conexão de internet ou tente novamente mais tarde.';
    } else if (error.message) {
      formattedError.message = `Erro na requisição: ${error.message}`;
    }
  
    return formattedError;
  };
  
  export const handleApiError = (
    error: any, 
    setError: (message: string) => void,
    callback?: () => void
  ) => {
    const formattedError = formatApiError(error);
    setError(formattedError.message);
    
    console.error('API Error:', error);
    
    if (callback) {
      callback();
    }
  };
  
  export default {
    formatApiError,
    handleApiError
  };