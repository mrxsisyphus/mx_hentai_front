import type { Response as AppResponse } from '@/types/response';

export const BASE_URL = process.env.PUBLIC_BASE_URL || '/api/v1';

// types/http-client.ts
export interface HttpClient {
  get<T>(
    url: string,
    config?: Record<string, unknown>,
  ): Promise<AppResponse<T>>;

  post<T>(
    url: string,
    data?: Record<string, unknown>,
    config?: Record<string, unknown>,
  ): Promise<AppResponse<T>>;
}

export class AppError extends Error {
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
