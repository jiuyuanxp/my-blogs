import { isApiError } from '@blog/api-client';

/** 将未知错误统一为展示用文案（与各页 try/catch 习惯一致） */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (isApiError(err)) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}
