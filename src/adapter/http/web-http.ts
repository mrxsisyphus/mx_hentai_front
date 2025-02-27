import axios, { type AxiosResponse } from 'axios';
import type { Response as AppResponse } from '@/types/response';
import Auth from '@/middleware/auth';
import { AppError, BASE_URL, type HttpClient } from './types';

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

API.interceptors.response.use(
  (response: AxiosResponse<AppResponse<unknown>>) => {
    if (response.status !== 200) {
      throw new Error(`network is abnormal status: ${response.status}`);
    }
    const code = response.data.code;
    if (code === 0) {
      return response;
    }
    if (code === 401) {
      Auth.signout();
      window.location.href = '/login';
    }
    throw new AppError(response.data.msg, response.data.code);
  },
  (error) => Promise.reject(error),
);
// API.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

export class WebHttpClient implements HttpClient {
  async get<T>(
    url: string,
    config?: Record<string, unknown>,
  ): Promise<AppResponse<T>> {
    const response = await API.get<AppResponse<T>>(url, config);
    return response.data;
  }
  async post<T>(
    url: string,
    data?: Record<string, unknown>,
    config?: Record<string, unknown>,
  ): Promise<AppResponse<T>> {
    const response = await API.post<AppResponse<T>>(url, data, config);
    return response.data;
  }
}
