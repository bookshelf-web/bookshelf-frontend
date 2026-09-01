import axios from 'axios';

const api = axios.create({
  // Dev/Docker uses a relative path (Vite proxies /api -> VITE_API_URL).
  // Production (GitHub Pages) has no proxy, so it hits the hosted API directly.
  baseURL: import.meta.env.PROD ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // BASE_URL already includes the GitHub Pages subpath (e.g. /bookshelf-frontend/).
      window.location.href = `${import.meta.env.BASE_URL}login`;
    }
    return Promise.reject(error);
  }
);

export default api;
