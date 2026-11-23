import axios from 'axios';

export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export const api = axios.create();

api.interceptors.request.use((config) => {
  const url = config.url || '';
  const protectedAdminDataRequest = /\/(getStudentsData|getBookingsData)(\?|$)/.test(url);
  const token = protectedAdminDataRequest
    ? localStorage.getItem('bookspot_admin_token') || localStorage.getItem('token')
    : localStorage.getItem('token') || localStorage.getItem('bookspot_admin_token');

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
