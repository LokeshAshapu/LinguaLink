import dotenv from 'dotenv';

dotenv.config();

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secretsecretsecretsecretsecretsecret';
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'ws://localhost:7880';

export class LiveKitService {
  /**
   * Generates a WebRTC connection token for a participant joining a LiveKit room.
   */
  public static generateRoomToken(roomName: string, participantIdentity: string, participantName: string): { token: string; url: string } {
    // Basic JWT token structure for LiveKit signaling fallback
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(
      JSON.stringify({
        iss: LIVEKIT_API_KEY,
        sub: participantIdentity,
        name: participantName,
        nbf: now,
        exp: now + 86400, // 24 hours
        video: {
          room: roomName,
          roomJoin: true,
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
        },
      })
    ).toString('base64url');

    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', LIVEKIT_API_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    const token = `${header}.${payload}.${signature}`;

    return {
      token,
      url: LIVEKIT_URL,
    };
  }
}
