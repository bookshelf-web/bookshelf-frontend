import axios from 'axios';

const api = axios.create({
  // Usa caminho relativo para que o proxy do Vite encaminhe as chamadas
  // corretamente tanto em desenvolvimento local quanto no Docker CI.
  // O Vite proxy redireciona /api → VITE_API_URL (backend container ou localhost)
  baseURL: '/api', // proxy do Vite encaminha para o backend correto
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;