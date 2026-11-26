import axios from 'axios';

export const BASE_URL = 'http://localhost:1337';

const api = axios.create({ baseURL: `${BASE_URL}/api` });

// attach the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;