// adapters/tauri-http.ts
import { fetch } from '@tauri-apps/plugin-http';
import { type HttpClient, AppError, BASE_URL } from './types';
import type { Response as AppResponse } from '@/types/response';
import Auth from '@/middleware/auth';

export class TauriHttpClient implements HttpClient {
  async get<T>(
    url: string,
    config?: Record<string, unknown>,
    headers?: Record<string, unknown>,
  ): Promise<AppResponse<T>> {
    const curl = `${BASE_URL}${url}`;
    console.log(`[tauri] get ${curl}`);
    const response: globalThis.Response = await fetch(curl, {
      method: 'GET',
      headers: {
        Origin: '',
        ...headers,
      },
      ...config,
    });
    return checkResponse<T>(response);
  }

  async post<T>(
    url: string,
    data?: Record<string, unknown>,
    config?: Record<string, unknown>,
    headers?: Record<string, unknown>,
  ): Promise<AppResponse<T>> {
    const curl = `${BASE_URL}${url}`;
    console.log(`[tauri] post ${curl} data: ${JSON.stringify(data)}`);
    // refer: https://github.com/tauri-apps/plugins-workspace/issues/1968
    const response: globalThis.Response = await fetch(curl, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        Origin: '',
        ...headers,
      },
      ...config,
    });
    return checkResponse<T>(response);
  }
}

const checkResponse = async <T>(response: globalThis.Response) => {
  if (response.status !== 200) {
    throw new Error(
      `network is abnormal status: ${response.status} text: ${response.statusText}`,
    );
  }
  const responseData: AppResponse<T> = await response.json();
  if (responseData.code === 0) {
    return Promise.resolve(responseData);
  }
  if (responseData.code === 401) {
    Auth.signout();
    window.location.href = '/login';
  }
  throw new AppError(responseData.msg, responseData.code);
};
