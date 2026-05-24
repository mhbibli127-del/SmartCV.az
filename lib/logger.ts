// Comprehensive logging system
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
  userId?: string;
  metadata?: Record<string, any>;
  stack?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>, stack?: string) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      metadata,
      stack
    };

    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with colors
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.FATAL]: '\x1b[35m', // Magenta
    };
    const reset = '\x1b[0m';

    const prefix = `${colors[level]}[${level}]${reset}`;
    const contextStr = context ? `[${context}]` : '';
    const metadataStr = metadata ? ` ${JSON.stringify(metadata)}` : '';
    const stackStr = stack ? `\n${stack}` : '';

    console.log(`${prefix} ${contextStr} ${message}${metadataStr}${stackStr}`);

    // In production, send to external logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalLogging(entry);
    }
  }

  private async sendToExternalLogging(entry: LogEntry) {
    try {
      // Send to your logging service (e.g., Sentry, LogRocket, DataDog)
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  debug(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }

  info(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context, metadata);
  }

  warn(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context, metadata);
  }

  error(message: string, context?: string, error?: Error, metadata?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, metadata, error?.stack);
  }

  fatal(message: string, context?: string, error?: Error, metadata?: Record<string, any>) {
    this.log(LogLevel.FATAL, message, context, metadata, error?.stack);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  setUserId(userId: string) {
    // Add userId to all subsequent logs
    this.logs.forEach(log => {
      if (!log.userId) {
        log.userId = userId;
      }
    });
  }
}

export const logger = Logger.getInstance();

// Error boundary utility
export function handleError(error: Error, context: string, metadata?: Record<string, any>) {
  logger.error(error.message, context, error, metadata);
  
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Send to Sentry, etc.
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(operation: string): number {
    return performance.now();
  }

  endMeasure(operation: string, startTime: number) {
    const duration = performance.now() - startTime;
    
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const durations = this.metrics.get(operation)!;
    durations.push(duration);
    
    // Keep only last 100 measurements
    if (durations.length > 100) {
      durations.shift();
    }
    
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    
    logger.debug(`Operation: ${operation}, Duration: ${duration.toFixed(2)}ms, Avg: ${avgDuration.toFixed(2)}ms`, 'performance');
    
    return duration;
  }

  getMetrics(operation: string) {
    const durations = this.metrics.get(operation);
    if (!durations || durations.length === 0) {
      return null;
    }
    
    return {
      count: durations.length,
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations)
    };
  }

  getAllMetrics() {
    const result: Record<string, any> = {};
    
    this.metrics.forEach((durations, operation) => {
      result[operation] = {
        count: durations.length,
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations)
      };
    });
    
    return result;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
