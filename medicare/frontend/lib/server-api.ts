import { getAccessTokenFromCookies } from './auth';
import { api } from './api';

export const serverApi = {
  get: <T>(path: string) => api.get<T>(path, getAccessTokenFromCookies()),
  post: <T>(path: string, body?: unknown) =>
    api.post<T>(path, body, getAccessTokenFromCookies()),
  patch: <T>(path: string, body?: unknown) =>
    api.patch<T>(path, body, getAccessTokenFromCookies()),
  delete: <T>(path: string) => api.delete<T>(path, getAccessTokenFromCookies()),
};
