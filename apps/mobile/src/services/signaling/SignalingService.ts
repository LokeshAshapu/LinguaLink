import { SignalingEventType, SignalingMessage } from '@lingualink/realtime-events';
import { ENV } from '../../config/env';

type MessageHandler = (message: SignalingMessage) => void;

export class SignalingService {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  private isConnecting: boolean = false;
  private reconnectTimer: any = null;

  public async connect(token: string): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.token === token) {
      console.log('[SIGNALING] Already connected');
      return;
    }

    this.token = token;
    this.disconnect();

    const wsUrl = `${ENV.SIGNALING_URL}?token=${encodeURIComponent(token)}`;
    console.log('[SIGNALING] Connecting to signaling server:', ENV.SIGNALING_URL);

    return new Promise((resolve, reject) => {
      try {
        console.log('[SIGNALING] Connecting');
        this.ws = new WebSocket(wsUrl);
        this.isConnecting = true;

        this.ws.onopen = () => {
          console.log('[SIGNALING] Connected');
          console.log('[SIGNALING] Authentication successful');
          this.isConnecting = false;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: SignalingMessage = JSON.parse(event.data.toString());
            console.log('[SIGNALING] Message received:', message.event, message.payload);
            this.emit(message.event, message);
          } catch (err) {
            console.error('[SIGNALING] Error parsing message:', err);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[SIGNALING] Connection failed:', error);
          if (this.isConnecting) {
            this.isConnecting = false;
            reject(error);
          }
        };

        this.ws.onclose = (event) => {
          console.log(`[SIGNALING] Connection closed (code: ${event.code})`);
          this.ws = null;
          this.isConnecting = false;
          // Reconnect logic if token still exists
          if (this.token && event.code !== 4001 && event.code !== 4002) {
            this.scheduleReconnect();
          }
        };
      } catch (err) {
        this.isConnecting = false;
        reject(err);
      }
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      if (this.token) {
        console.log('[SIGNALING] Attempting reconnection...');
        this.connect(this.token).catch((err) => {
          console.warn('[SIGNALING] Reconnect failed:', err);
        });
      }
    }, 3000);
  }

  public disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.token = null;
    console.log('[SIGNALING] Disconnected');
  }

  public send<T extends SignalingEventType>(event: T, payload: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[SIGNALING] Cannot send message, WebSocket not open');
      return;
    }
    const message: SignalingMessage<T> = {
      event,
      payload,
      timestamp: Date.now(),
    };
    console.log('[SIGNALING] Sending event:', event, payload);
    this.ws.send(JSON.stringify(message));
  }

  public on(event: string, handler: MessageHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    return () => {
      this.off(event, handler);
    };
  }

  public off(event: string, handler: MessageHandler): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  private emit(event: string, message: SignalingMessage): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((h) => h(message));
    }
  }
}

export const signalingService = new SignalingService();
