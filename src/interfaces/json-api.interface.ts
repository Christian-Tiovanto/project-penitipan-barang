export interface JsonApiValidationErrorDetail {
  type: string;
  context?: Record<string, any>;
}

export interface JsonApiValidationError {
  status: string;
  source: string;
  title: string;
  detail: JsonApiValidationErrorDetail;
}

export interface JsonApiNotFoundError extends JsonApiValidationError {}

export interface JsonApiForbiddenError {
  status: string;
  message: string;
  missing_permissions: string[];
}

export interface JsonApiConflictError extends JsonApiValidationError {
  value?: string;
}
