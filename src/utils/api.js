import axios from 'axios';

export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export const api = axios.create();

export function setStudentToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export function setAdminToken(token) {
  if (token) localStorage.setItem('bookspot_admin_token', token);
  else localStorage.removeItem('bookspot_admin_token');
}

api.interceptors.request.use((config) => {
  const url = config.url || '';
  const protectedAdminDataRequest = /\/(getStudentsData|getBookingsData)(\?|$)/.test(url);
  const token = (protectedAdminDataRequest
    ? localStorage.getItem('bookspot_admin_token') || localStorage.getItem('token')
    : localStorage.getItem('token') || localStorage.getItem('bookspot_admin_token'))?.trim();

  if (token) {
    const authorization = `Bearer ${token}`;
    if (typeof config.headers?.set === 'function') {
      config.headers.set('Authorization', authorization);
    } else {
      config.headers = { ...config.headers, Authorization: authorization };
    }
  }

  return config;
});
