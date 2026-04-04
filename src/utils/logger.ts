/**
 * Simple structured logger with timestamps.
 * Can be replaced with winston/pino in production.
 */

enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

function formatMessage(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level}] ${message}`;
  if (data !== undefined) {
    return `${base} | ${JSON.stringify(data)}`;
  }
  return base;
}

const logger = {
  info(message: string, data?: unknown): void {
    console.log(formatMessage(LogLevel.INFO, message, data));
  },

  warn(message: string, data?: unknown): void {
    console.warn(formatMessage(LogLevel.WARN, message, data));
  },

  error(message: string, data?: unknown): void {
    console.error(formatMessage(LogLevel.ERROR, message, data));
  },

  debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(formatMessage(LogLevel.DEBUG, message, data));
    }
  },
};

export default logger;
