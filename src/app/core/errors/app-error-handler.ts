import { ErrorHandler, Injectable } from '@angular/core';
import { formatErrorForLog } from './error-format';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    console.error('[AppError]', formatErrorForLog(error));
  }
}
