import { Room, RoomEvent, Track } from 'livekit-client';
import { ensureWebRTCGlobalsRegistered } from '../../polyfills';

export class LiveKitService {
  private room: Room | null = null;
  private isMuted: boolean = false;

  public async connect(url: string, token: string): Promise<Room> {
    console.log('[MEDIA] Connecting to LiveKit Room:', url);
    
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
      console.log('[MEDIA] Successfully connected to LiveKit room:', this.room.name);

      // Enable microphone input for audio call
      try {
        await this.room.localParticipant.setMicrophoneEnabled(true);
        console.log('[MEDIA] Local microphone enabled and publishing');
      } catch (micErr) {
        console.warn('[MEDIA] Microphone publish warning:', micErr);
      }

      return this.room;
    } catch (error: any) {
      console.error('[MEDIA] Failed to connect to LiveKit room:', error);
      throw error;
    }
  }

  private setupRoomEvents() {
    if (!this.room) return;

    this.room.on(RoomEvent.Connected, () => {
      console.log('[MEDIA] Room event: Connected');
    });

    this.room.on(RoomEvent.Disconnected, (reason) => {
      console.log('[MEDIA] Room event: Disconnected, reason:', reason);
    });

    this.room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log('[MEDIA] Participant connected:', participant.identity, participant.name);
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log('[MEDIA] Participant disconnected:', participant.identity);
    });

    this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      console.log('[MEDIA] Track subscribed:', track.kind, 'from participant:', participant.identity);
      if (track.kind === Track.Kind.Audio) {
        // Attach audio track for playback
        const audioElement = track.attach();
        if (audioElement && typeof audioElement.play === 'function') {
          audioElement.play().catch((err) => {
            console.warn('[MEDIA] Autoplay audio failed:', err);
          });
        }
      }
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
      console.log('[MEDIA] Track unsubscribed:', track.kind);
      track.detach();
    });
  }

  public async setMuted(muted: boolean): Promise<void> {
    if (!this.room) return;
    this.isMuted = muted;
    try {
      await this.room.localParticipant.setMicrophoneEnabled(!muted);
      console.log(`[MEDIA] Microphone ${muted ? 'muted' : 'unmuted'}`);
    } catch (err) {
      console.warn('[MEDIA] Set muted failed:', err);
    }
  }

  public isMicrophoneMuted(): boolean {
    return this.isMuted;
  }

  public async disconnect(): Promise<void> {
    if (this.room) {
      console.log('[MEDIA] Disconnecting from LiveKit room');
      try {
        await this.room.localParticipant.setMicrophoneEnabled(false);
        await this.room.disconnect();
      } catch (err) {
        console.warn('[MEDIA] Disconnect error:', err);
      } finally {
        this.room = null;
      }
    }
  }
}

export const liveKitService = new LiveKitService();
