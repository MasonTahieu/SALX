import { env } from '../config/env';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any) {
    super(data?.error || data?.message || `HTTP ${status}`);
    this.status = status;
    this.data = data;
  }
}

export async function api<T>(
  path: string,
  options: RequestInit & { adminKey?: string } = {},
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (options.adminKey) headers.set('x-admin-key', options.adminKey);

  const response = await fetch(`${env.apiUrl}${path}`, { ...options, headers });
  const text = await response.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!response.ok) throw new ApiError(response.status, data);
  return data as T;
}
