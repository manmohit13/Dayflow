import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

export const BASE_URL = 'http://localhost:1337';

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

// Attach the token only to requests that require authentication.
api.interceptors.request.use((config) => {
  const isAuthRequest = config.url?.startsWith('/auth/');
  const token = isAuthRequest ? null : localStorage.getItem('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    if (
      error.response?.status !== 401 ||
      !config ||
      config._retry ||
      config.url?.startsWith('/auth/')
    ) {
      return Promise.reject(error);
    }

    config._retry = true;
    if (!refreshPromise) {
      refreshPromise = api
        .post<{ jwt?: string }>('/auth/refresh')
        .then(({ data }) => {
          if (!data.jwt) {
            throw new Error('The refresh response did not include an access token.');
          }
          localStorage.setItem('jwt', data.jwt);
          return data.jwt;
        })
        .catch((refreshError: unknown) => {
          localStorage.removeItem('jwt');
          throw refreshError;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      const jwt = await refreshPromise;
      config.headers.Authorization = `Bearer ${jwt}`;
      return api.request(config);
    } catch {
      return Promise.reject(error);
    }
  }
);

export default api;