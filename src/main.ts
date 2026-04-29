import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { formatErrorForLog } from './app/core/errors/error-format';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error('[BootstrapError]', formatErrorForLog(err)));
