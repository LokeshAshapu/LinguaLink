import { Room, RoomEvent, Track, ConnectionState } from 'livekit-client';
import { ensureWebRTCGlobalsRegistered } from '../../polyfills';

export class LiveKitService {
  private room: Room | null = null;
  private isMuted: boolean = false;

  public async connect(url: string, token: string): Promise<Room> {
    console.log('[MEDIA] Room/session connecting...');
    console.log('[MEDIA] Token received, connecting to LiveKit URL:', url);
    
    // Ensure WebRTC globals (RTCPeerConnection, navigator.mediaDevices) are registered
    ensureWebRTCGlobalsRegistered();

    // Clean up previous room if existing
    await this.disconnect();

    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
      audioCaptureDefaults: {
        autoGainControl: true,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    this.setupRoomEvents();

    try {
      await this.room.connect(url, token);
      console.log('[MEDIA] Connection established. Connected to LiveKit room:', this.room.name || 'default');

      // Enable microphone input for audio call
      try {
        await this.room.localParticipant.setMicrophoneEnabled(true);
        console.log('[MEDIA] Local microphone publishing');
      } catch (micErr: any) {
        console.warn('[MEDIA] Local microphone publishing failed code=' + (micErr?.code || 'UNKNOWN') + ' reason=' + (micErr?.message || micErr));
      }

      return this.room;
    } catch (error: any) {
      console.error('[MEDIA] Connection failed code=' + (error?.code || 'CONN_FAIL') + ' reason=' + (error?.message || error) + ' state=' + (this.room?.state || ConnectionState.Disconnected));
      throw error;
    }
  }

  private setupRoomEvents() {
    if (!this.room) return;

    this.room.on(RoomEvent.Connected, () => {
      console.log('[MEDIA] Room event: Connected, state=' + (this.room?.state || 'CONNECTED'));
    });

    this.room.on(RoomEvent.Disconnected, (reason) => {
      console.log('[MEDIA] Room event: Disconnected, reason=' + reason);
    });

    this.room.on(RoomEvent.Reconnecting, () => {
      console.log('[MEDIA] Room event: Reconnecting...');
    });

    this.room.on(RoomEvent.Reconnected, () => {
      console.log('[MEDIA] Room event: Reconnected successfully');
    });

    this.room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log('[MEDIA] Remote participant detected:', participant.identity, participant.name || 'Remote User');
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log('[MEDIA] Remote participant disconnected:', participant.identity);
    });

    this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      console.log('[MEDIA] Remote audio subscribed:', track.kind, 'from participant:', participant.identity);
      if (track.kind === Track.Kind.Audio) {
        try {
          const audioElement = track.attach();
          if (audioElement && typeof audioElement.play === 'function') {
            audioElement.play().catch((err) => {
              console.warn('[MEDIA] Autoplay audio warning:', err?.message || err);
            });
          }
        } catch (attachErr) {
          console.warn('[MEDIA] Audio track attach warning:', attachErr);
        }
      }
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
      console.log('[MEDIA] Track unsubscribed:', track.kind, 'from participant:', participant.identity);
      try {
        track.detach();
      } catch (err) {}
    });
  }

  public async setMuted(muted: boolean): Promise<void> {
    if (!this.room) return;
    this.isMuted = muted;
    try {
      await this.room.localParticipant.setMicrophoneEnabled(!muted);
      console.log(`[MEDIA] Microphone ${muted ? 'muted' : 'unmuted'}`);
    } catch (err: any) {
      console.warn('[MEDIA] Set muted failed reason=' + (err?.message || err));
    }
  }

  public isMicrophoneMuted(): boolean {
    return this.isMuted;
  }

  public getRoomState(): string {
    return this.room ? String(this.room.state) : 'DISCONNECTED';
  }

  public async disconnect(): Promise<void> {
    if (this.room) {
      console.log('[MEDIA] Disconnecting from LiveKit room');
      try {
        await this.room.localParticipant.setMicrophoneEnabled(false);
        await this.room.disconnect();
      } catch (err: any) {
        console.warn('[MEDIA] Disconnect warning:', err?.message || err);
      } finally {
        this.room = null;
      }
    }
  }
}

export const liveKitService = new LiveKitService();
