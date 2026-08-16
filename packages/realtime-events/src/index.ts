import { CallStatus, LanguageCode, LiveCaption, LatencyMetrics } from '@lingualink/types';

export enum SignalingEventType {
  // Call Session Lifecycle
  CALL_INITIATE = 'CALL_INITIATE',
  CALL_RINGING = 'CALL_RINGING',
  CALL_ACCEPT = 'CALL_ACCEPT',
  CALL_REJECT = 'CALL_REJECT',
  CALL_STATE_CHANGE = 'CALL_STATE_CHANGE',
  CALL_END = 'CALL_END',

  // Audio & Speech Pipeline
  SPEECH_STARTED = 'SPEECH_STARTED',
  SPEECH_PARTIAL = 'SPEECH_PARTIAL',
  SPEECH_FINAL = 'SPEECH_FINAL',
  LANGUAGE_DETECTED = 'LANGUAGE_DETECTED',

  // AI & Captions Pipeline
  TRANSLATION_STARTED = 'TRANSLATION_STARTED',
  TRANSLATION_COMPLETED = 'TRANSLATION_COMPLETED',
  TTS_STARTED = 'TTS_STARTED',
  TTS_AUDIO_READY = 'TTS_AUDIO_READY',
  CAPTION_UPDATE = 'CAPTION_UPDATE',

  // Fallback & Metrics
  AI_ERROR = 'AI_ERROR',
  FALLBACK_ACTIVATED = 'FALLBACK_ACTIVATED',
  LATENCY_REPORT = 'LATENCY_REPORT',
}

export interface SignalingPayloads {
  [SignalingEventType.CALL_INITIATE]: {
    callId: string;
    callerId: string;
    callerName: string;
    receiverId: string;
    sourceLanguage: LanguageCode;
    targetLanguage: LanguageCode;
  };
  [SignalingEventType.CALL_RINGING]: {
    callId: string;
    receiverId: string;
    callerId?: string;
    callerName?: string;
    sourceLanguage?: LanguageCode;
  };
  [SignalingEventType.CALL_ACCEPT]: {
    callId: string;
    receiverId: string;
    livekitToken: string;
    livekitUrl: string;
  };
  [SignalingEventType.CALL_REJECT]: {
    callId: string;
    reason?: string;
  };
  [SignalingEventType.CALL_STATE_CHANGE]: {
    callId: string;
    status: CallStatus;
  };
  [SignalingEventType.CALL_END]: {
    callId: string;
    endedBy: string;
    reason?: string;
  };
  [SignalingEventType.SPEECH_STARTED]: { callId: string; speakerId: string };
  [SignalingEventType.SPEECH_PARTIAL]: { callId: string; speakerId: string; text: string };
  [SignalingEventType.SPEECH_FINAL]: { callId: string; speakerId: string; text: string };
  [SignalingEventType.LANGUAGE_DETECTED]: { callId: string; language: LanguageCode; confidence: number };
  [SignalingEventType.TRANSLATION_STARTED]: { callId: string; sourceLang: LanguageCode; targetLang: LanguageCode };
  [SignalingEventType.TRANSLATION_COMPLETED]: { callId: string; text: string };
  [SignalingEventType.TTS_STARTED]: { callId: string };
  [SignalingEventType.TTS_AUDIO_READY]: { callId: string; audioUrl?: string };
  [SignalingEventType.CAPTION_UPDATE]: LiveCaption;
  [SignalingEventType.FALLBACK_ACTIVATED]: { callId: string; mode: string };
  [SignalingEventType.LATENCY_REPORT]: LatencyMetrics;
  [SignalingEventType.AI_ERROR]: {
    callId: string;
    stage: 'STT' | 'TRANSLATION' | 'TTS' | 'LANGUAGE_DETECTION';
    message: string;
    isRecoverable: boolean;
  };
}

export interface SignalingMessage<T extends SignalingEventType = SignalingEventType> {
  event: T;
  payload: SignalingPayloads[T];
  timestamp: number;
}
