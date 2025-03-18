import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5241',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const tipoProcessoMap: Record<string, 'Manual' | 'Sistemico'> = {
  '0': 'Manual',
  '1': 'Sistemico',
  'manual': 'Manual',
  'Manual': 'Manual',
  'sistemico': 'Sistemico',
  'Sistemico': 'Sistemico'
};

const statusProcessoMap: Record<string, 'Implementado' | 'EmImplementacao' | 'Planejado' | 'Problematico' | 'Obsoleto'> = {
  '0': 'Implementado',
  '1': 'EmImplementacao',
  '2': 'Planejado',
  '3': 'Problematico',
  '4': 'Obsoleto',
  'implementado': 'Implementado',
  'emImplementacao': 'EmImplementacao',
  'planejado': 'Planejado',
  'problematico': 'Problematico',
  'obsoleto': 'Obsoleto'
};

const convertEnums = (obj: any): any => {
  if (!obj) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertEnums(item));
  }
  
  if (typeof obj !== 'object') {
    return obj;
  }

  const result = { ...obj };
  
  if ('tipo' in result && result.tipo !== undefined) {
    const tipoKey = String(result.tipo);
    result.tipo = tipoProcessoMap[tipoKey] || result.tipo;
  }
  
  if ('status' in result && result.status !== undefined) {
    const statusKey = String(result.status);
    result.status = statusProcessoMap[statusKey] || result.status;
  }
  
  Object.keys(result).forEach(key => {
    if (result[key] && typeof result[key] === 'object') {
      result[key] = convertEnums(result[key]);
    }
  });
  
  return result;
};

/* api.interceptors.request.use(request => {
  console.log('Enviando requisição:', request.method?.toUpperCase(), request.baseURL + request.url);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('Resposta original:', response.config.method?.toUpperCase(), response.config.url, response.status);
    
    // Converter enums na resposta
    if (response.data) {
      response.data = convertEnums(response.data);
    }
    
    return response;
  },
  error => {
    console.error('Erro na API:', 
      error.config?.method?.toUpperCase(), 
      error.config?.url, 
      error.response?.status,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
); */

export default api;