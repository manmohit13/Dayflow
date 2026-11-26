import axios from 'axios';

export const BASE_URL = 'http://localhost:1337';

const api = axios.create({ baseURL: `${BASE_URL}/api` });

// Attach the token only to requests that require authentication.
api.interceptors.request.use((config) => {
  const isAuthRequest = config.url?.startsWith('/auth/');
  const token = isAuthRequest ? null : localStorage.getItem('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;