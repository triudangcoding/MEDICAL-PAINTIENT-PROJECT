import { ConsoleLogger, Injectable, LogLevel, Scope } from '@nestjs/common';
import { isObject } from '@nestjs/common/utils/shared.utils';
import chalk from 'chalk';
import dayjs from 'dayjs';

type LogLevels = LogLevel | 'trace';

interface LogMessage {
  message: string;
  data?: unknown;
  metadata?: Record<string, unknown>;
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
  protected static lastTimestampAt?: number;
  protected context?: string;

  protected logLevels: LogLevels[] = [
    'error',
    'warn',
    'log',
    'debug',
    'verbose',
    'trace'
  ];

  constructor(context?: string) {
    super(context as string);
    this.context = context;
  }

  setLogLevels(levels: LogLevels[]) {
    this.logLevels = levels;
  }

  log(message: LogMessage | string, context?: string): void {
    if (!this.isLevelEnabled('log')) {
      return;
    }
    const { messages, contextMessage } = this.getMessageAndContext(
      message,
      context || this.context,
      'log'
    );
    this.printMessages(messages, contextMessage, 'log');
  }

  error(message: LogMessage | string, stack?: string, context?: string): void {
    if (!this.isLevelEnabled('error')) {
      return;
    }
    const { messages, contextMessage } = this.getMessageAndContext(
      message,
      context || this.context,
      'error'
    );
    this.printMessages(messages, contextMessage, 'error', stack);
  }

  warn(message: LogMessage | string, context?: string): void {
    if (!this.isLevelEnabled('warn')) {
      return;
    }
    const { messages, contextMessage } = this.getMessageAndContext(
      message,
      context || this.context,
      'warn'
    );
    this.printMessages(messages, contextMessage, 'warn');
  }

  /**
   * Write a 'debug' level log
   */
  debug(message: LogMessage | string, context?: string): void {
    if (!this.isLevelEnabled('debug')) {
      return;
    }
    const { messages, contextMessage } = this.getMessageAndContext(
      message,
      context || this.context,
      'debug'
    );
    this.printMessages(messages, contextMessage, 'debug');
  }

  /**
   * Write a 'verbose' level log
   */
  verbose(message: LogMessage | string, context?: string): void {
    if (!this.isLevelEnabled('verbose')) {
      return;
    }
    const { messages, contextMessage } = this.getMessageAndContext(
      message,
      context || this.context,
      'verbose'
    );
    this.printMessages(messages, contextMessage, 'verbose');
  }

  /**
   * Write a 'trace' level log - Cấp độ bổ sung
   */
  trace(message: LogMessage | string, context?: string): void {
    if (!this.isLevelEnabled('trace')) {
      return;
    }
    const { messages, contextMessage } = this.getMessageAndContext(
      message,
      context || this.context,
      'trace'
    );
    this.printMessages(messages, contextMessage, 'trace');
  }

  /**
   * Kiểm tra xem cấp độ log có được bật không
   */
  isLevelEnabled(level: LogLevels): boolean {
    return this.logLevels.includes(level);
  }

  /**
   * Định dạng message và context để in ra
   */
  private getMessageAndContext(
    message: LogMessage | string,
    context?: string,
    logLevel?: LogLevels
  ) {
    let messages: any[] = [];
    if (message instanceof Array) {
      messages = message;
    } else if (isObject(message)) {
      messages = [this.formatObject(message)];
    } else {
      messages = [message];
    }

    const contextMessage = this.formatContext(context, logLevel);
    return { messages, contextMessage };
  }

  /**
   * In messages ra console với màu sắc và định dạng
   */
  protected printMessages(
    messages: unknown[],
    contextMessage: string,
    logLevel: LogLevels = 'log',
    stack?: string
  ) {
    const timestamp = this.getTimestamp();
    const timestampDiff = this.updateAndGetTimestampDiff();
    const formattedLogLevel = this.formatLogLevel(logLevel);

    messages.forEach((message) => {
      const timestampNumber = parseInt(timestampDiff, 10);
      const formattedTime = chalk.gray(`${timestamp}`);
      const formattedDiff = this.formatTimestampDiff(timestampNumber);
      const output = `${formattedTime} ${formattedDiff} ${formattedLogLevel}${contextMessage ? ' ' + contextMessage : ''} ${chalk.reset(String(message))}`;

      if (logLevel === 'error' && stack) {
        process.stderr.write(`${output}\n${chalk.yellow(stack)}\n`);
      } else {
        process.stdout.write(`${output}\n`);
      }
    });
  }

  /**
   * Format object để in ra dễ đọc
   */
  protected formatObject(object: any): string {
    try {
      return JSON.stringify(object, null, 2);
    } catch (error: any) {
      return `[Không thể hiển thị đối tượng: ${error.message}]`;
    }
  }

  /**
   * Format context message với màu sắc
   */
  protected formatContext(context?: string, logLevel?: LogLevels): string {
    if (!context) {
      return '';
    }
    return chalk.cyan(`[${context}]`);
  }

  /**
   * Format log level với các màu khác nhau
   */
  protected formatLogLevel(level: LogLevels): string {
    switch (level) {
      case 'error':
        return chalk.red(`[ERROR]`);
      case 'warn':
        return chalk.yellow(`[WARN]`);
      case 'debug':
        return chalk.blue(`[DEBUG]`);
      case 'verbose':
        return chalk.magenta(`[VERBOSE]`);
      case 'trace':
        return chalk.grey(`[TRACE]`);
      default:
        return chalk.green(`[LOG]`);
    }
  }

  /**
   * Lấy timestamp hiện tại
   */
  protected getTimestamp(): string {
    return dayjs().format('YYYY-MM-DD HH:mm:ss.SSS');
  }

  /**
   * Tính thời gian trôi qua từ log cuối cùng
   */
  protected updateAndGetTimestampDiff(): string {
    const now = Date.now();
    if (!LoggerService.lastTimestampAt) {
      LoggerService.lastTimestampAt = now;
      return '0ms';
    }
    const diff = now - LoggerService.lastTimestampAt;
    LoggerService.lastTimestampAt = now;
    return `${diff}ms`;
  }

  /**
   * Format timestamp difference
   */
  protected formatTimestampDiff(timestampDiff: number): string {
    return chalk.gray(`+${timestampDiff.toString().padStart(3, '0')}ms`);
  }
}
