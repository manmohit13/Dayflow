import axios from 'axios';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const api = axios.create({
  baseURL: 'http://localhost:1337/api',
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = api.post<{ jwt: string }>('/auth/refresh')
      .then(({ data }) => {
        localStorage.setItem('jwt', data.jwt);
        return data.jwt;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// attach the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token && config.url !== '/auth/local' && config.url !== '/auth/refresh') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const config = error.config;
    if (config._retry || config.url === '/auth/local' || config.url === '/auth/refresh') {
      return Promise.reject(error);
    }

    config._retry = true;
    try {
      const token = await refreshAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
      return await api.request(config);
    } catch (refreshError: unknown) {
      localStorage.removeItem('jwt');
      window.location.replace('/');
      return Promise.reject(refreshError);
    }
  }
);

export default api;