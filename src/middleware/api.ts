import axios, { type AxiosResponse } from 'axios';
import type { Response } from '../types/response';
import Auth from './auth';

export const baseURL = import.meta.env.PUBLIC_BASE_URL || '/api/v1';

export const getBaseURL = () => {
  return baseURL;
};
class AppError extends Error {
  code: number;
  message: string;
  stack: string | undefined;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
    this.message = message || '未知错误';
    this.stack = new Error().stack;
  }
}

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

API.interceptors.response.use(
  (response: AxiosResponse<Response<unknown>>) => {
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
// API.defaults.headers.common['Access-Control-Allow-Origin'] = "*"

export default API;
