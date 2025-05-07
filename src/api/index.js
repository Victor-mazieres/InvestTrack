// src/api/index.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Injecte le token automatiquement
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercepte les 401 et ne redirige que si on n'est pas déjà sur /connexion
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      const loginPath = '/connexion';
      if (window.location.pathname !== loginPath) {
        // remplace l’historique (évite de pouvoir “revenir” en arrière et recliquer)
        window.location.replace(loginPath);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
