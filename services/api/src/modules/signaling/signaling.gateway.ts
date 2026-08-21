import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import { SignalingEventType, SignalingMessage } from '@lingualink/realtime-events';
import { SecurityService } from '../../shared/security';
import { CallsService } from '../calls/calls.service';
import { LiveKitService } from './livekit.service';
import { db } from '../../shared/database';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  callId?: string;
  isAlive?: boolean;
}

export class SignalingGateway {
  private wss: WebSocketServer;
  private clients: Map<string, AuthenticatedWebSocket> = new Map(); // userId -> socket

  constructor(server: http.Server) {
    this.wss = new WebSocketServer({ server, path: '/signaling' });

    this.wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
      ws.isAlive = true;

      // Extract JWT token from query string
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(4001, 'Unauthorized: Missing token');
        return;
      }

      try {
        const payload = SecurityService.verifyToken(token);
        ws.userId = payload.userId;
        this.clients.set(payload.userId, ws);
        console.log(`🔌 Signaling client connected: ${payload.userId}`);
      } catch (err) {
        ws.close(4002, 'Unauthorized: Invalid token');
        return;
      }

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (messageRaw: string) => {
        try {
          const message: SignalingMessage = JSON.parse(messageRaw.toString());
          this.handleSignalingMessage(ws, message);
        } catch (error) {
          console.error('Failed to parse signaling message:', error);
        }
      });

      ws.on('close', () => {
        if (ws.userId) {
          this.clients.delete(ws.userId);
          console.log(`🔌 Signaling client disconnected: ${ws.userId}`);
        }
      });
    });

    // Heartbeat ping/pong interval
    setInterval(() => {
      this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  private handleSignalingMessage(ws: AuthenticatedWebSocket, message: SignalingMessage) {
    const { event, payload } = message;
    console.log(`[SIGNALING] Received event: ${event} from user: ${ws.userId || 'unknown'}`);

    switch (event) {
      case SignalingEventType.CALL_INITIATE: {
        const p = payload as any;
        ws.callId = p.callId;
        console.log(`[SIGNALING] CALL_INITIATE callId=${p.callId} caller=${p.callerId} receiver=${p.receiverId}`);

        // Forward call notification to receiver if connected
        const receiverSocket = this.clients.get(p.receiverId);
        if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
          console.log(`[SIGNALING] Sending CALL_RINGING to receiver ${p.receiverId}`);
          receiverSocket.send(
            JSON.stringify({
              event: SignalingEventType.CALL_RINGING,
              payload: {
                callId: p.callId,
                receiverId: p.receiverId,
                callerId: p.callerId,
                callerName: p.callerName,
                sourceLanguage: p.sourceLanguage,
              },
              timestamp: Date.now(),
            })
          );
        } else {
          console.warn(`[SIGNALING] Receiver socket for user ${p.receiverId} not available or closed`);
        }
        break;
      }

      case SignalingEventType.CALL_ACCEPT: {
        const p = payload as any;
        console.log(`[SIGNALING] CALL_ACCEPT callId=${p.callId} accepted by user=${ws.userId}`);
        CallsService.updateCallStatus(p.callId, 'CONNECTED');

        const call = db.calls.get(p.callId);
        if (call) {
          const callerSocket = this.clients.get(call.callerId);
          if (callerSocket && callerSocket.readyState === WebSocket.OPEN) {
            console.log(`[SIGNALING] Sending CALL_STATE_CHANGE CONNECTED to caller ${call.callerId}`);
            callerSocket.send(
              JSON.stringify({
                event: SignalingEventType.CALL_STATE_CHANGE,
                payload: {
                  callId: p.callId,
                  status: 'CONNECTED',
                  livekitToken: p.livekitToken,
                  livekitUrl: p.livekitUrl,
                },
                timestamp: Date.now(),
              })
            );
          }
        }
        break;
      }

      case SignalingEventType.CALL_END: {
        const p = payload as any;
        console.log(`[SIGNALING] CALL_END callId=${p.callId} ended by user=${ws.userId}`);
        CallsService.updateCallStatus(p.callId, 'ENDED');

        const call = db.calls.get(p.callId);
        if (call) {
          const targetId = call.callerId === ws.userId ? call.receiverId : call.callerId;
          const targetSocket = this.clients.get(targetId);
          if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
            console.log(`[SIGNALING] Forwarding CALL_END to peer ${targetId}`);
            targetSocket.send(
              JSON.stringify({
                event: SignalingEventType.CALL_END,
                payload: { callId: p.callId, endedBy: ws.userId },
                timestamp: Date.now(),
              })
            );
          }
        }
        break;
      }

      default:
        console.log(`[SIGNALING] Unhandled signaling event: ${event}`);
    }
  }

  public broadcastToRoom(callId: string, message: SignalingMessage) {
    const jsonStr = JSON.stringify(message);
    this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
      if (ws.callId === callId && ws.readyState === WebSocket.OPEN) {
        ws.send(jsonStr);
      }
    });
  }
}
