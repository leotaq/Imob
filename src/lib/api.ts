// Configuração centralizada da API

// URL base da API baseada no ambiente
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const API_BASE_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

// Helper para fazer requisições autenticadas
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Helper para requisições GET
export const apiGet = async (endpoint: string) => {
  const response = await apiRequest(endpoint, { method: 'GET' });
  return response.json();
};

// Helper para requisições POST
export const apiPost = async (endpoint: string, data?: any) => {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  return response.json();
};

// Helper para requisições PUT
export const apiPut = async (endpoint: string, data?: any) => {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
  return response.json();
};

// Helper para requisições PATCH
export const apiPatch = async (endpoint: string, data?: any) => {
  const response = await apiRequest(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
  return response.json();
};

// Helper para requisições DELETE
export const apiDelete = async (endpoint: string) => {
  const response = await apiRequest(endpoint, { method: 'DELETE' });
  return response.json();
};