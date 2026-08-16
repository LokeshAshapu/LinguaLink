export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export class AICircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureThreshold = 3;
  private resetTimeoutMs = 10000;
  private failureCount = 0;
  private lastFailureTime = 0;

  public async execute<T>(action: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        console.warn('⚠️ Circuit breaker OPEN: Using fallback provider action');
        return fallback();
      }
    }

    try {
      const result = await action();
      if (this.state === CircuitState.HALF_OPEN) {
        this.reset();
      }
      return result;
    } catch (error) {
      this.recordFailure();
      console.error('AI execution failure recorded:', error);
      return fallback();
    }
  }

  private recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      console.warn(`🚨 AI Circuit Breaker switched to OPEN state after ${this.failureCount} consecutive failures`);
    }
  }

  public reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }

  public getState(): CircuitState {
    return this.state;
  }
}
