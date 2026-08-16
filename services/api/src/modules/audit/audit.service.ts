import { PrivacyService } from './privacy.service';

export interface AuditLogEntry {
  requestId?: string;
  userId?: string;
  callId?: string;
  event: string;
  status: 'SUCCESS' | 'FAILURE' | 'INFO';
  latencyMs?: number;
  metadata?: Record<string, any>;
}

export class AuditService {
  public static logEvent(entry: AuditLogEntry): void {
    const timestamp = new Date().toISOString();
    const sanitizedMetadata = entry.metadata ? PrivacyService.sanitizeForLog(entry.metadata) : undefined;

    const logPayload = {
      timestamp,
      service: 'lingualink-api',
      requestId: entry.requestId || 'req_internal',
      userId: entry.userId || 'system',
      callId: entry.callId || 'none',
      event: entry.event,
      status: entry.status,
      latencyMs: entry.latencyMs ?? 0,
      metadata: sanitizedMetadata,
    };

    console.log(`[AUDIT] ${JSON.stringify(logPayload)}`);
  }
}
