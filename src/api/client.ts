import { authClient } from '@/auth/auth-client';

import { API_V1 } from './config';
import { ApiError } from './errors';
import type { PageMeta } from './types';

type QueryValue = string | number | boolean | readonly (string | number)[] | null | undefined;
export type Query = Record<string, QueryValue>;

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  query?: Query;
  body?: unknown;
  timeoutMs?: number;
  /** Attach the Better Auth session cookie (default true). */
  auth?: boolean;
}

interface Envelope<T> {
  success: boolean;
  data?: T;
  meta?: unknown;
  error?: { code?: string; message?: string; details?: unknown };
}

/** Builds `?a=1&ids=x,y`; skips empty values, joins arrays as CSV (what the backend expects). */
export function qs(params?: Query): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length) search.set(key, value.join(','));
    } else {
      search.set(key, String(value));
    }
  }
  const s = search.toString();
  return s ? `?${s}` : '';
}

async function requestEnvelope<T>(method: Method, path: string, opts: RequestOptions = {}): Promise<Envelope<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15_000);

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.auth !== false) {
    const cookie = await authClient.getCookie();
    if (cookie) headers.Cookie = cookie;
  }

  let res: Response;
  try {
    res = await fetch(`${API_V1}${path}${qs(opts.query)}`, {
      method,
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      // The cookie is set by hand above; letting the platform cookie jar join in causes stale duplicates.
      credentials: 'omit',
      signal: controller.signal,
    });
  } catch (err) {
    throw new ApiError(controller.signal.aborted ? 'TIMEOUT' : 'NETWORK', 0, err instanceof Error ? err.message : String(err));
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 204) return { success: true, data: null as T };

  let json: Envelope<T>;
  try {
    json = (await res.json()) as Envelope<T>;
  } catch {
    throw new ApiError('PARSE', res.status, `Invalid JSON from ${method} ${path}`);
  }

  if (!res.ok || json.success === false) {
    throw new ApiError(json.error?.code ?? 'INTERNAL_ERROR', res.status, json.error?.message ?? res.statusText, json.error?.details);
  }
  return json;
}

async function request<T>(method: Method, path: string, opts?: RequestOptions): Promise<T> {
  return (await requestEnvelope<T>(method, path, opts)).data as T;
}

export interface Paged<T, M = PageMeta> {
  data: T[];
  meta: M;
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, { query }),
  getPublic: <T>(path: string, query?: Query) => request<T>('GET', path, { query, auth: false }),
  /** For list endpoints that return `meta` alongside `data`. */
  getPaged: async <T, M = PageMeta>(path: string, query?: Query): Promise<Paged<T, M>> => {
    const env = await requestEnvelope<T[]>('GET', path, { query });
    return { data: env.data ?? [], meta: env.meta as M };
  },
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body }),
  del: <T = null>(path: string, body?: unknown) => request<T>('DELETE', path, { body }),
};
