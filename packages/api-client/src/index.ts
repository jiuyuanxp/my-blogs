/**
 * @blog/api-client
 * 规范化 API 客户端，遵循 api-design 技能
 * - 结构化错误响应 { error: { code, message, details? } }
 * - 请求超时
 * - API 错误码透传
 */

export interface ApiErrorDetail {
  field: string;
  message: string;
  code?: string;
}

/** 后端错误格式，与 Java ErrorResponse 一致 */
export interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: ApiErrorDetail[];

  constructor(
    message: string,
    options: {
      code?: string;
      status?: number;
      details?: ApiErrorDetail[];
    } = {}
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = options.code ?? 'unknown_error';
    this.status = options.status ?? 0;
    this.details = options.details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromResponse(status: number, body: unknown): ApiError {
    const payload = body as ApiErrorPayload | null;
    const error = payload?.error;
    if (error?.code && error?.message) {
      return new ApiError(error.message, {
        code: error.code,
        status,
        details: error.details,
      });
    }
    const fallback = status === 401 ? 'UNAUTHORIZED' : `HTTP_${status}`;
    return new ApiError(error?.message ?? `HTTP ${status}`, {
      code: fallback,
      status,
    });
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

export interface RequestConfig {
  /** 超时毫秒，默认 10000 */
  timeout?: number;
  /** 自定义 headers */
  headers?: Record<string, string>;
}

export interface CreateClientOptions {
  baseUrl: string;
  /** 获取 token，用于 Authorization: Bearer */
  getToken?: () => string | null;
  /** 401 时回调，如清除 token */
  onUnauthorized?: () => void;
  defaultTimeout?: number;
}

/** 将 API 返回的 number id 转为 string，避免 JS 精度丢失 */
export function normalizeIds<T extends object>(
  obj: T,
  idKeys = ['id', 'categoryId', 'parentId', 'articleId']
): T {
  const result = { ...obj } as Record<string, unknown>;
  for (const key of idKeys) {
    if (key in result && typeof result[key] === 'number') {
      result[key] = String(result[key]);
    }
  }
  return result as T;
}

export function createClient(options: CreateClientOptions) {
  const { baseUrl, getToken, onUnauthorized, defaultTimeout = 10000 } = options;

  async function request<T>(
    path: string,
    init: RequestInit = {},
    config: RequestConfig = {}
  ): Promise<T> {
    const url = path.startsWith('http')
      ? path
      : `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
    const timeout = config.timeout ?? defaultTimeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
      ...(init.headers as Record<string, string>),
    };
    if (getToken?.()) {
      headers['Authorization'] = `Bearer ${getToken()}`;
    }

    try {
      const res = await fetch(url, {
        ...init,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.status === 401) {
        onUnauthorized?.();
        const body = await res.json().catch(() => ({}));
        throw ApiError.fromResponse(401, body);
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw ApiError.fromResponse(res.status, body);
      }

      if (res.status === 204) return undefined as T;
      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof ApiError) throw err;
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          throw new ApiError('请求超时', { code: 'timeout', status: 0 });
        }
        throw err;
      }
      throw err;
    }
  }

  return {
    request,
    get: <T>(path: string, config?: RequestConfig) => request<T>(path, { method: 'GET' }, config),
    post: <T>(path: string, body?: unknown, config?: RequestConfig) =>
      request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }, config),
    put: <T>(path: string, body?: unknown, config?: RequestConfig) =>
      request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }, config),
    delete: <T>(path: string, config?: RequestConfig) =>
      request<T>(path, { method: 'DELETE' }, config),
  };
}
