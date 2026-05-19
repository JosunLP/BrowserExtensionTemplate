import { escapeHtml } from '@bquery/bquery/security';

export class ErrorBoundary {
  private static instance: ErrorBoundary;
  private errorHandlers: Array<(error: Error) => void> = [];

  /**
   * Produces an HTML-escaped representation of an error message using
   * bQuery's security primitives. Use this when surfacing untrusted error
   * text inside HTML text content; other sinks (for example URLs, styles, or
   * scriptable attributes) still need context-specific validation/encoding.
   */
  public static formatErrorMessage(message: string): string {
    return escapeHtml(message);
  }

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): ErrorBoundary {
    if (!ErrorBoundary.instance) {
      ErrorBoundary.instance = new ErrorBoundary();
    }
    return ErrorBoundary.instance;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle uncaught errors
    window.addEventListener('error', event => {
      this.handleError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.handleError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        { type: 'unhandledrejection' }
      );
    });
  }

  public addErrorHandler(handler: (error: Error) => void): void {
    this.errorHandlers.push(handler);
  }

  public removeErrorHandler(handler: (error: Error) => void): void {
    const index = this.errorHandlers.indexOf(handler);
    if (index > -1) {
      this.errorHandlers.splice(index, 1);
    }
  }

  public handleError(error: Error, context?: Record<string, unknown>): void {
    console.error('Error caught by ErrorBoundary:', error, context);

    // Call all registered error handlers
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });

    // Send to background script if available
    if (chrome.runtime) {
      chrome.runtime
        .sendMessage({
          type: 'error',
          payload: {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: Date.now(),
          },
        })
        .catch(() => {
          // Ignore errors when sending to background
        });
    }
  }

  public wrapAsync<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError(error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    };
  }

  public wrapSync<T extends unknown[], R>(fn: (...args: T) => R): (...args: T) => R {
    return (...args: T): R => {
      try {
        return fn(...args);
      } catch (error) {
        this.handleError(error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    };
  }
}
