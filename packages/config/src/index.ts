import { LanguageCode } from '@lingualink/types';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flagEmoji: string;
  isPriority: boolean;
}

export const SUPPORTED_LANGUAGES: Record<LanguageCode, LanguageInfo> = {
  'te-IN': {
    code: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flagEmoji: '🇮🇳',
    isPriority: true,
  },
  'hi-IN': {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flagEmoji: '🇮🇳',
    isPriority: true,
  },
  'en-US': {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English',
    flagEmoji: '🇺🇸',
    isPriority: true,
  },
  'ta-IN': {
    code: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flagEmoji: '🇮🇳',
    isPriority: true,
  },
  'kn-IN': {
    code: 'kn-IN',
    name: 'Kannada',
    nativeName: 'கன்னட',
    flagEmoji: '🇮🇳',
    isPriority: true,
  },
  'ml-IN': {
    code: 'ml-IN',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flagEmoji: '🇮🇳',
    isPriority: true,
  },
  'bn-IN': {
    code: 'bn-IN',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flagEmoji: '🇮🇳',
    isPriority: true,
  },
  'mr-IN': {
    code: 'mr-IN',
    name: 'Marathi',
    nativeName: 'मराठी',
    flagEmoji: '🇮🇳',
    isPriority: true,
  },
};

export const DEFAULT_LANGUAGE: LanguageCode = 'te-IN';

export const LATENCY_TARGETS = {
  STT_MS: 300,
  TRANSLATION_MS: 200,
  TTS_FIRST_BYTE_MS: 350,
  TOTAL_END_TO_END_MS: 1000,
};

export const FEATURE_FLAGS = {
  AUTO_LANGUAGE_DETECTION: true,
  LIVE_CAPTIONS: true,
  VOICE_TRANSLATION: true,
  TEXT_FALLBACK: true,
  CONVERSATION_CONTEXT: true,
};
