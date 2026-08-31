import axios from 'axios';

const api = axios.create({
  // Em dev/Docker usa caminho relativo (proxy do Vite encaminha /api → VITE_API_URL).
  // Em produção (GitHub Pages) não há proxy, então bate direto na API hospedada.
  baseURL: import.meta.env.PROD ? `${import.meta.env.VITE_API_URL}/api` : '/api',
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
      // BASE_URL já inclui o basename do GitHub Pages (ex: /bookshelf-frontend/)
      window.location.href = `${import.meta.env.BASE_URL}login`;
    }
    return Promise.reject(error);
  }
);

export default api;