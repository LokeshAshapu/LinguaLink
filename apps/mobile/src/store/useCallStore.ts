import { CallStatus, LanguageCode, LiveCaption } from '@lingualink/types';
import { callsApi } from '../services/api/callsApi';
import { signalingService } from '../services/signaling/SignalingService';
import { liveKitService } from '../services/media/LiveKitService';
import { SignalingEventType } from '@lingualink/realtime-events';

export interface IncomingCallData {
  callId: string;
  callerId: string;
  callerName: string;
  callerLanguage?: LanguageCode;
}

export interface CallStoreState {
  currentCallId: string | null;
  callStatus: CallStatus;
  remoteUserId: string | null;
  remoteUserName: string | null;
  remoteUserLanguage: LanguageCode | null;
  isMuted: boolean;
  isSpeakerOn: boolean;
  areCaptionsEnabled: boolean;
  callDurationSeconds: number;
  originalCaption: string;
  translatedCaption: string;
  livekitToken: string | null;
  livekitUrl: string | null;
  incomingCall: IncomingCallData | null;
  errorMessage: string | null;
}

export class CallStore {
  private state: CallStoreState = {
    currentCallId: null,
    callStatus: 'IDLE',
    remoteUserId: null,
    remoteUserName: null,
    remoteUserLanguage: null,
    isMuted: false,
    isSpeakerOn: true,
    areCaptionsEnabled: true,
    callDurationSeconds: 0,
    originalCaption: '',
    translatedCaption: '',
    livekitToken: null,
    livekitUrl: null,
    incomingCall: null,
    errorMessage: null,
  };

  private listeners: Array<() => void> = [];
  private durationTimer: any = null;

  public getState(): CallStoreState {
    return { ...this.state };
  }

  public setState(partial: Partial<CallStoreState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- SIGNALING LISTENERS SETUP ---
  public setupSignalingListeners() {
    signalingService.on(SignalingEventType.CALL_RINGING, (message) => {
      const p = message.payload as any;
      console.log('[CALL] CALL_RINGING received callId=' + p.callId + ' from caller=' + p.callerId);
      
      if (this.state.callStatus === 'IDLE' && !this.state.currentCallId) {
        this.setState({
          incomingCall: {
            callId: p.callId,
            callerId: p.callerId || 'usr_unknown',
            callerName: p.callerName || 'Incoming Contact',
            callerLanguage: p.sourceLanguage || 'te-IN',
          },
        });
      }
    });

    signalingService.on(SignalingEventType.CALL_STATE_CHANGE, async (message) => {
      const p = message.payload as any;
      const { callId, status, livekitToken, livekitUrl } = p;
      console.log('[CALL] CALL_STATE_CHANGE received status=' + status + ' callId=' + callId);
      
      if (status === 'CONNECTED' && this.state.currentCallId === callId) {
        this.setState({ callStatus: 'CONNECTING' });
        const targetUrl = livekitUrl || this.state.livekitUrl;
        const targetToken = livekitToken || this.state.livekitToken;

        if (targetUrl && targetToken) {
          try {
            console.log('[MEDIA] Room/session connecting...');
            await liveKitService.connect(targetUrl, targetToken);
            this.setCallConnected();
          } catch (err: any) {
            console.error('[MEDIA] Connection failed code=' + (err?.code || 'CONN_ERR') + ' reason=' + (err?.message || err) + ' state=' + liveKitService.getRoomState());
            this.setState({ callStatus: 'FAILED', errorMessage: err?.message || 'Media connection failed' });
          }
        } else {
          console.warn('[MEDIA] Connection failed code=NO_TOKEN reason=Missing LiveKit token or URL state=DISCONNECTED');
          this.setState({ callStatus: 'FAILED', errorMessage: 'Missing LiveKit media credentials' });
        }
      }
    });

    signalingService.on(SignalingEventType.CALL_END, (message) => {
      const { callId } = message.payload as any;
      console.log('[CALL] CALL_END received for callId=' + callId);
      if (this.state.currentCallId === callId || this.state.incomingCall?.callId === callId) {
        this.resetCall();
      }
    });

    signalingService.on(SignalingEventType.CALL_REJECT, (message) => {
      const { callId } = message.payload as any;
      console.log('[CALL] CALL_REJECT received for callId=' + callId);
      if (this.state.currentCallId === callId) {
        this.resetCall();
      }
    });
  }

  // --- CALL INITIATION (CALLER FLOW) ---
  public async initiateCall(
    receiverId: string,
    receiverName: string,
    receiverLanguage: LanguageCode,
    currentUserId: string,
    currentUserName: string,
    currentUserLanguage: LanguageCode
  ) {
    console.log('[CALL] Initiating call to receiverId=' + receiverId);
    this.setState({
      callStatus: 'CALLING',
      remoteUserId: receiverId,
      remoteUserName: receiverName,
      remoteUserLanguage: receiverLanguage,
      errorMessage: null,
    });

    try {
      console.log('[CALL] API request sent POST /calls/initiate');
      const res = await callsApi.initiateCall(receiverId);
      console.log('[CALL] API response received status=201');
      console.log('[CALL] Call ID received callId=' + res.call.id);

      this.setState({
        currentCallId: res.call.id,
        livekitToken: res.livekitToken,
        livekitUrl: res.livekitUrl,
        callStatus: 'RINGING',
      });

      console.log('[CALL] CALL_RINGING sent via WebSocket signaling');
      signalingService.send(SignalingEventType.CALL_INITIATE, {
        callId: res.call.id,
        callerId: currentUserId,
        callerName: currentUserName,
        receiverId,
        sourceLanguage: currentUserLanguage,
        targetLanguage: receiverLanguage,
      });
    } catch (err: any) {
      console.error('[CALL] Initiate call failed code=' + (err?.code || 'INIT_ERR') + ' reason=' + (err?.message || err));
      this.setState({
        callStatus: 'FAILED',
        errorMessage: err?.message || 'Call initiation failed',
      });
    }
  }

  // --- INCOMING CALL HANDLER (RECEIVER FLOW) ---
  public setIncomingCall(data: IncomingCallData) {
    if (this.state.callStatus === 'IDLE') {
      this.setState({ incomingCall: data });
    }
  }

  public async acceptIncomingCall(currentUserId: string) {
    const incoming = this.state.incomingCall;
    if (!incoming) return;

    const callId = incoming.callId;
    console.log('[CALL] Accept pressed for callId=' + callId);

    this.setState({
      currentCallId: callId,
      remoteUserId: incoming.callerId,
      remoteUserName: incoming.callerName,
      remoteUserLanguage: incoming.callerLanguage || 'te-IN',
      callStatus: 'CONNECTING',
      incomingCall: null,
      errorMessage: null,
    });

    try {
      console.log('[CALL] API request sent POST /calls/' + callId + '/accept');
      const res = await callsApi.acceptCall(callId);
      console.log('[CALL] API response received status=200');

      this.setState({
        livekitToken: res.livekitToken,
        livekitUrl: res.livekitUrl,
      });

      console.log('[CALL] CALL_ACCEPT sent via WebSocket signaling');
      signalingService.send(SignalingEventType.CALL_ACCEPT, {
        callId,
        receiverId: currentUserId,
        livekitToken: res.livekitToken,
        livekitUrl: res.livekitUrl,
      });

      console.log('[MEDIA] Room/session connecting...');
      await liveKitService.connect(res.livekitUrl, res.livekitToken);
      this.setCallConnected();
    } catch (err: any) {
      console.error('[CALL] Accept call failed code=' + (err?.code || 'ACCEPT_ERR') + ' reason=' + (err?.message || err));
      this.setState({
        callStatus: 'FAILED',
        errorMessage: err?.message || 'Accepting call failed',
      });
    }
  }

  public async rejectIncomingCall() {
    const incoming = this.state.incomingCall;
    if (!incoming) return;

    try {
      await callsApi.rejectCall(incoming.callId);
      signalingService.send(SignalingEventType.CALL_REJECT, {
        callId: incoming.callId,
      });
    } catch (err) {
      console.warn('[CALL] Reject call API warning:', err);
    } finally {
      this.setState({ incomingCall: null });
    }
  }

  // --- CONNECTED CALL DURATION TIMER ---
  private setCallConnected() {
    console.log('[CALL] CONNECTED');
    this.setState({ callStatus: 'CONNECTED' });
    this.startTimer();
  }

  private startTimer() {
    this.stopTimer();
    this.setState({ callDurationSeconds: 0 });
    this.durationTimer = setInterval(() => {
      this.setState({ callDurationSeconds: this.state.callDurationSeconds + 1 });
    }, 1000);
  }

  private stopTimer() {
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
      this.durationTimer = null;
    }
  }

  // --- MUTE & CONTROLS ---
  public async toggleMute() {
    const newMuted = !this.state.isMuted;
    await liveKitService.setMuted(newMuted);
    this.setState({ isMuted: newMuted });
  }

  // --- END CALL & RESET ---
  public async resetCall() {
    this.stopTimer();
    const callId = this.state.currentCallId;

    if (callId) {
      try {
        await callsApi.endCall(callId);
        signalingService.send(SignalingEventType.CALL_END, {
          callId,
          endedBy: this.state.remoteUserId || 'unknown',
        });
      } catch (err) {
        console.warn('[CALL] End call request warning:', err);
      }
    }

    await liveKitService.disconnect();

    this.setState({
      currentCallId: null,
      callStatus: 'IDLE',
      remoteUserId: null,
      remoteUserName: null,
      remoteUserLanguage: null,
      isMuted: false,
      callDurationSeconds: 0,
      originalCaption: '',
      translatedCaption: '',
      livekitToken: null,
      livekitUrl: null,
      incomingCall: null,
      errorMessage: null,
    });
  }
}

export const callStore = new CallStore();
