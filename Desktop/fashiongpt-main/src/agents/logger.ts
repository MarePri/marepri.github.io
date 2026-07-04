// ─── Agent Layer: Structured Logger ───────────────────────────────────────────
// All agents use this logger. Output includes agent name, timestamp, and level.

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/** Runtime configuration for the logger */
let _debugEnabled = false;

export function enableDebug(enabled: boolean): void {
  _debugEnabled = enabled;
}

function timestamp(): string {
  return new Date().toISOString();
}

function formatMessage(agent: string, level: LogLevel, message: string, data?: unknown): string {
  const prefix = `[${timestamp()}] [${level.toUpperCase()}] [${agent}]`;
  if (data !== undefined) {
    return `${prefix} ${message} ${JSON.stringify(data)}`;
  }
  return `${prefix} ${message}`;
}

export function log(agent: string, level: LogLevel, message: string, data?: unknown): void {
  if (level === 'debug' && !_debugEnabled) return;
  const formatted = formatMessage(agent, level, message, data);

  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'debug':
      console.debug(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export function info(agent: string, message: string, data?: unknown): void {
  log(agent, 'info', message, data);
}

export function warn(agent: string, message: string, data?: unknown): void {
  log(agent, 'warn', message, data);
}

export function error(agent: string, message: string, data?: unknown): void {
  log(agent, 'error', message, data);
}

export function debug(agent: string, message: string, data?: unknown): void {
  log(agent, 'debug', message, data);
}

export default { enableDebug, log, info, warn, error, debug };
