import { findClosestMatch } from './utils';

/**
 * ErrorHandler - Provides helpful error messages and suggestions
 */
export class ErrorHandler {
  /**
   * Generates error message for unknown command
   */
  commandNotFound(command: string, availableCommands: string[]): string {
    const suggestion = findClosestMatch(command, availableCommands);
    let message = `\x1b[91mCommand not found: ${command}\x1b[0m`;
    
    if (suggestion) {
      message += `\r\n\x1b[2mDid you mean '${suggestion}'?\x1b[0m`;
    }
    
    message += `\r\n\x1b[2mType 'help' for available commands.\x1b[0m`;
    return message;
  }

  /**
   * Generates error message for invalid arguments
   */
  invalidArguments(command: string, message: string, usage?: string): string {
    let output = `\x1b[91mInvalid arguments for '${command}': ${message}\x1b[0m`;
    
    if (usage) {
      output += `\r\n\x1b[2mUsage: ${usage}\x1b[0m`;
    }
    
    return output;
  }

  /**
   * Generates error message for file/path not found
   */
  fileNotFound(path: string, availablePaths: string[] = []): string {
    const suggestion = findClosestMatch(path, availablePaths);
    let message = `\x1b[91mPath not found: ${path}\x1b[0m`;
    
    if (suggestion) {
      message += `\r\n\x1b[2mDid you mean '${suggestion}'?\x1b[0m`;
    }
    
    return message;
  }

  /**
   * Generates error message for permission denied
   */
  permissionDenied(action: string): string {
    return `\x1b[91mPermission denied: ${action}\x1b[0m`;
  }

  /**
   * Generates error message for invalid option
   */
  invalidOption(option: string, validOptions: string[]): string {
    const suggestion = findClosestMatch(option.replace(/^-+/, ''), validOptions);
    let message = `\x1b[91mUnknown option: ${option}\x1b[0m`;
    
    if (suggestion) {
      message += `\r\n\x1b[2mDid you mean '--${suggestion}'?\x1b[0m`;
    }
    
    message += `\r\n\x1b[2mValid options: ${validOptions.map((o) => `--${o}`).join(', ')}\x1b[0m`;
    return message;
  }

  /**
   * Generates error message for API/network errors
   */
  apiError(error: { code?: string; message: string }): string {
    const errorCode = error.code ? ` [${error.code}]` : '';
    return `\x1b[91mAPI Error${errorCode}: ${error.message}\x1b[0m\r\n\x1b[2mPlease try again later.\x1b[0m`;
  }

  /**
   * Generates error message for filtered content
   */
  contentFiltered(): string {
    return `\x1b[93mThis content was blocked by provider safety filters.\x1b[0m\r\n\x1b[2mTry rephrasing or removing sensitive details.\x1b[0m`;
  }

  /**
   * Generates error message for rate limiting
   */
  rateLimited(retryAfter?: number): string {
    const retryMessage = retryAfter
      ? `Please try again in ${retryAfter} seconds.`
      : 'Please try again later.';
    return `\x1b[93mRate limit exceeded.\x1b[0m\r\n\x1b[2m${retryMessage}\x1b[0m`;
  }

  /**
   * Generates a generic error message
   */
  generic(message: string): string {
    return `\x1b[91mError: ${message}\x1b[0m`;
  }
}

export const errorHandler = new ErrorHandler();
