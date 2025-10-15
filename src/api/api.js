// src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('token'); // adapte si besoin

function buildHeaders(body, extra = {}) {
  const headers = { ...extra };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  return headers;
}

async function request(path, { method = 'GET', headers = {}, body, signal, ...rest } = {}) {
  const res = await fetch(
    path.startsWith('http') ? path : `${API_BASE}${path}`,
    {
      method,
      headers: buildHeaders(body, headers),
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      credentials: 'include', // utile si cookies
      signal,
      ...rest,
    }
  );
  const isJson = res.headers.get('content-type')?.includes('application/json');
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try { msg += isJson ? `: ${JSON.stringify(await res.json())}` : `: ${await res.text()}`; } catch {}
    throw new Error(msg);
  }
  return isJson ? res.json() : res.text();
}

export const api = {
  get : (p, opt) => request(p, { ...opt }),
  post: (p, body, opt) => request(p, { method: 'POST', body, ...opt }),
  put : (p, body, opt) => request(p, { method: 'PUT', body, ...opt }),
  del : (p, opt) => request(p, { method: 'DELETE', ...opt }),
  baseUrl: API_BASE,
};
