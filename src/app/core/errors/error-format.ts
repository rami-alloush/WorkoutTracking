type ErrorLike = {
  name?: unknown;
  message?: unknown;
  stack?: unknown;
  code?: unknown;
  cause?: unknown;
  originalError?: unknown;
  ngOriginalError?: unknown;
  rejection?: unknown;
};

export function formatErrorForLog(error: unknown): string {
  const value = unwrapError(error);

  if (value instanceof Error) {
    return [formatErrorSummary(value), value.stack].filter(Boolean).join('\n');
  }

  if (isErrorLike(value)) {
    const name = stringifyIfPresent(value.name);
    const message = stringifyIfPresent(value.message);
    const code = stringifyIfPresent(value.code);
    const stack = stringifyIfPresent(value.stack);

    const summary = [name, code ? `(${code})` : '', message]
      .filter(Boolean)
      .join(' ')
      .trim();

    return [summary || safeStringify(value), stack].filter(Boolean).join('\n');
  }

  if (typeof value === 'string') {
    return value;
  }

  return safeStringify(value);
}

function unwrapError(error: unknown): unknown {
  let current: any = error;
  const seen = new Set<unknown>();

  while (current != null && typeof current === 'object' && !seen.has(current)) {
    seen.add(current);

    // ErrorEvent / PromiseRejectionEvent from provideBrowserGlobalErrorListeners
    if (typeof ErrorEvent !== 'undefined' && current instanceof ErrorEvent) {
      current = current.error ?? current.message ?? current;
      if (seen.has(current)) break;
      continue;
    }
    if (typeof PromiseRejectionEvent !== 'undefined' && current instanceof PromiseRejectionEvent) {
      current = current.reason;
      if (seen.has(current)) break;
      continue;
    }

    if (current.rejection != null) {
      current = current.rejection;
      continue;
    }

    if (current.ngOriginalError != null) {
      current = current.ngOriginalError;
      continue;
    }

    if (current.originalError != null) {
      current = current.originalError;
      continue;
    }

    if (current.cause != null) {
      current = current.cause;
      continue;
    }

    break;
  }

  return current;
}

function formatErrorSummary(error: Error): string {
  const code = isErrorLike(error) ? stringifyIfPresent((error as ErrorLike).code) : '';
  const prefix = error.name || 'Error';
  const suffix = code ? ` (${code})` : '';
  const message = error.message || 'Unknown error';
  return `${prefix}${suffix}: ${message}`;
}

function isErrorLike(value: unknown): value is ErrorLike {
  return typeof value === 'object' && value !== null;
}

function stringifyIfPresent(value: unknown): string {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
}

function safeStringify(value: unknown): string {
  if (value == null) {
    return 'Unknown error';
  }

  try {
    const json = JSON.stringify(value, Object.getOwnPropertyNames(value as object), 2);
    if (json && json !== '{}') {
      return json;
    }
  } catch {
    // fall through
  }

  try {
    const asStr = String(value);
    if (asStr && asStr !== '[object Object]') {
      return asStr;
    }
  } catch {
    // fall through
  }

  return 'Unknown error';
}
