export interface ErrorSource {
  path: string;
  message: string;
}

export interface ErrorResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  stack?: string | undefined;
  errorSources?: ErrorSource[];
  error?: unknown;
}
