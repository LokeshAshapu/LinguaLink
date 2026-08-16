import { PrivacyService } from '../modules/audit/privacy.service';
import { AuditService } from '../modules/audit/audit.service';

describe('Phase 12: Security, Privacy Redaction & Audit Trail', () => {
  it('should redact sensitive PII fields from log payloads', () => {
    const rawMetadata = {
      userEmail: 'userA@lingualink.ai',
      password: 'mySecretPassword',
      token: 'jwt_token_xyz',
      originalText: 'మీరు ఎలా ఉన్నారు?',
      translatedText: 'आप कैसे हैं?',
      callDuration: 120,
    };

    const sanitized = PrivacyService.sanitizeForLog(rawMetadata);

    expect(sanitized.userEmail).toBe('userA@lingualink.ai');
    expect(sanitized.password).toBe('[REDACTED_PRIVACY]');
    expect(sanitized.token).toBe('[REDACTED_PRIVACY]');
    expect(sanitized.originalText).toBe('[REDACTED_PRIVACY]');
    expect(sanitized.translatedText).toBe('[REDACTED_PRIVACY]');
    expect(sanitized.callDuration).toBe(120);
  });

  it('should log structured audit events without throwing exceptions', () => {
    expect(() => {
      AuditService.logEvent({
        userId: 'usr_telugu_001',
        callId: 'call_audit_test_1',
        event: 'CALL_CONNECTED',
        status: 'SUCCESS',
        latencyMs: 880,
      });
    }).not.toThrow();
  });
});
