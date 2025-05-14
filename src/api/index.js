import axios from 'axios';

const API_URL  = 'http://localhost:5000/api';
const CSRF_URL = 'http://localhost:5000/csrf-token';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // pour envoyer le cookie de session + csrf-cookie
});

// Flag interne pour ne pas récupérer le CSRF token à chaque fois
let csrfFetched = false;
let csrfToken   = null;

api.interceptors.request.use(
  async config => {
    // 1) On injecte le Bearer token si présent
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2) Si c'est une requête mutative (POST, PUT, PATCH, DELETE)
    if (
      !csrfFetched &&
      ['post', 'put', 'patch', 'delete'].includes(config.method)
    ) {
      // On récupère le CSRF token depuis votre backend Express
      const resp = await axios.get(CSRF_URL, { withCredentials: true });
      csrfToken   = resp.data.csrfToken;
      csrfFetched = true;
    }

    // 3) On ajoute le header que csurf attend
    if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }

    return config;
  },
  error => Promise.reject(error)
);

// 4) Logout automatique sur 401
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      const path = window.location.pathname;
      if (!['/connexion', '/inscription'].includes(path)) {
        window.dispatchEvent(new CustomEvent('sessionExpired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
