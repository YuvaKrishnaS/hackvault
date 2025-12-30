/**
 * Centralized Error Handling
 * Provides consistent error messages and logging
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class EncryptionError extends AppError {
  constructor(message: string) {
    super(message, 'ENCRYPTION_ERROR');
  }
}

export class StorageError extends AppError {
  constructor(message: string) {
    super(message, 'STORAGE_ERROR');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR');
  }
}

// Error logger
export function logError(error: Error | AppError, context?: Record<string, any>) {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    message: error.message,
    stack: error.stack,
    context,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', errorLog);
  }

  // In production, you could send to error tracking service
  // Example: Sentry.captureException(error);
}

// Get user-friendly error message
export function getUserFriendlyError(error: Error | AppError): string {
  if (error instanceof AppError) {
    return error.message;
  }

  // Map common errors to user-friendly messages
  const errorMap: Record<string, string> = {
    'QuotaExceededError': 'Storage quota exceeded. Please delete some passwords or clear browser data.',
    'NotAllowedError': 'Permission denied. Please check your browser settings.',
    'NetworkError': 'Network error. Please check your internet connection.',
  };

  return errorMap[error.name] || 'An unexpected error occurred. Please try again.';
}
