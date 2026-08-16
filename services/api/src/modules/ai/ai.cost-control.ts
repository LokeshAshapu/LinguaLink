export class AICostControl {
  private static activeCallUsage: Map<string, { requestsCount: number; startTime: number }> = new Map();
  private static maxRequestsPerCall = 5000;
  private static maxCallDurationSeconds = parseInt(process.env.MAX_CALL_DURATION_SECONDS || '3600', 10);

  public static trackRequest(callId: string): boolean {
    let callData = this.activeCallUsage.get(callId);
    if (!callData) {
      callData = { requestsCount: 0, startTime: Date.now() };
      this.activeCallUsage.set(callId, callData);
    }

    callData.requestsCount++;

    const durationSeconds = Math.floor((Date.now() - callData.startTime) / 1000);

    if (callData.requestsCount > this.maxRequestsPerCall) {
      console.warn(`🛑 Cost Control: Call ${callId} exceeded maximum allowed AI request threshold (${this.maxRequestsPerCall})`);
      return false;
    }

    if (durationSeconds > this.maxCallDurationSeconds) {
      console.warn(`🛑 Cost Control: Call ${callId} exceeded maximum allowed call duration (${this.maxCallDurationSeconds}s)`);
      return false;
    }

    return true;
  }

  public static clearCall(callId: string) {
    this.activeCallUsage.delete(callId);
  }
}
