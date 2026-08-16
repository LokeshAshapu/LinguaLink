// --- LINGUALINK CORE DATA MODELS ---

export type LanguageCode =
  | 'te-IN' // Telugu
  | 'hi-IN' // Hindi
  | 'en-US' // English
  | 'ta-IN' // Tamil
  | 'kn-IN' // Kannada
  | 'ml-IN' // Malayalam
  | 'bn-IN' // Bengali
  | 'mr-IN'; // Marathi

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  displayName: string;
  profileImage?: string | null;
  nativeLanguage: LanguageCode;
  preferredListeningLanguage: LanguageCode;
  uiLanguage: LanguageCode;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type CallStatus =
  | 'IDLE'
  | 'CALLING'
  | 'RINGING'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'TRANSLATING'
  | 'RECONNECTING'
  | 'ENDED'
  | 'FAILED';

export interface Call {
  id: string;
  callerId: string;
  receiverId: string;
  status: CallStatus;
  startedAt?: Date | string | null;
  endedAt?: Date | string | null;
  duration?: number | null; // in seconds
  createdAt: Date | string;
}

export interface CallParticipant {
  id: string;
  callId: string;
  userId: string;
  role: 'CALLER' | 'RECEIVER';
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  joinedAt?: Date | string | null;
  leftAt?: Date | string | null;
}

export interface CallEvent {
  id: string;
  callId: string;
  eventType: string;
  metadata?: Record<string, any> | null;
  timestamp: Date | string;
}

// --- CAPTIONS & TRANSLATION PIPELINE TYPES ---

export interface LiveCaption {
  id: string;
  callId: string;
  speakerId: string;
  speakerName: string;
  originalText: string;
  originalLanguage: LanguageCode;
  translatedText: string;
  targetLanguage: LanguageCode;
  isPartial: boolean;
  confidence: number;
  timestamp: number;
}

export interface LatencyMetrics {
  callId: string;
  segmentId: string;
  audioCaptureMs: number;
  networkUploadMs: number;
  sttMs: number;
  translationMs: number;
  ttsMs: number;
  networkDeliveryMs: number;
  playbackMs: number;
  totalEndToEndMs: number;
  timestamp: number;
}

// --- AI GATEWAY PROVIDER INTERFACES ---

export interface STTOptions {
  language?: LanguageCode;
  autoDetectLanguage?: boolean;
  sampleRate?: number;
  interimResults?: boolean;
}

export interface TranscriptEvent {
  text: string;
  isFinal: boolean;
  detectedLanguage?: LanguageCode;
  confidence: number;
  timestamp: number;
}

export interface SpeechToTextProvider {
  name: string;
  transcribeStream(
    audioStream: AsyncIterable<Buffer>,
    options: STTOptions
  ): AsyncIterable<TranscriptEvent>;
}

export interface TranslationInput {
  text: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  context?: string[];
}

export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: LanguageCode;
  confidence: number;
  latencyMs: number;
}

export interface TranslationProvider {
  name: string;
  translate(input: TranslationInput): Promise<TranslationResult>;
}

export interface TTSInput {
  text: string;
  targetLanguage: LanguageCode;
  voiceGender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
}

export interface AudioChunk {
  audioBuffer: Buffer;
  isFinal: boolean;
  timestamp: number;
}

export interface TextToSpeechProvider {
  name: string;
  synthesizeStream(input: TTSInput): AsyncIterable<AudioChunk>;
}

export interface LanguageDetectionResult {
  detectedLanguage: LanguageCode;
  confidence: number;
}

export interface LanguageDetectionProvider {
  name: string;
  detectLanguage(text: string): Promise<LanguageDetectionResult>;
}
