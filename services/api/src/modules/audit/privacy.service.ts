export class PrivacyService {
  /**
   * Enforces privacy guidelines: scrubs raw transcript or audio content from data objects before logging.
   */
  public static sanitizeForLog(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data };
    const sensitiveKeys = ['password', 'passwordHash', 'token', 'apiKey', 'rawAudio', 'transcriptText', 'originalText', 'translatedText'];

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.includes(key)) {
        sanitized[key] = '[REDACTED_PRIVACY]';
      }
    }

    return sanitized;
  }
}
