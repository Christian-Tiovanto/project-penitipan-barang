import { ErrorCode } from '@app/enums/error-code';

export interface PgError extends Error {
  code?: ErrorCode;
  detail?: string;
}

export function isPgError(err: unknown): err is PgError {
  return typeof (err as PgError).code === 'string';
}
