import {
  SpeechToTextProvider,
  TranslationProvider,
  TextToSpeechProvider,
  LanguageDetectionProvider,
} from '@lingualink/types';

import { MockSTTProvider } from './adapters/mock-stt.provider';
import { MockTranslationProvider } from './adapters/mock-translation.provider';
import { MockTTSProvider } from './adapters/mock-tts.provider';
import { MockLanguageDetectionProvider } from './adapters/mock-language-detection.provider';
import { AICircuitBreaker } from './ai.circuit-breaker';

export class AIGateway {
  private static instance: AIGateway;

  private sttProvider: SpeechToTextProvider;
  private translationProvider: TranslationProvider;
  private ttsProvider: TextToSpeechProvider;
  private languageDetectionProvider: LanguageDetectionProvider;
  public circuitBreaker: AICircuitBreaker;

  private constructor() {
    this.sttProvider = new MockSTTProvider();
    this.translationProvider = new MockTranslationProvider();
    this.ttsProvider = new MockTTSProvider();
    this.languageDetectionProvider = new MockLanguageDetectionProvider();
    this.circuitBreaker = new AICircuitBreaker();
  }

  public static getInstance(): AIGateway {
    if (!AIGateway.instance) {
      AIGateway.instance = new AIGateway();
    }
    return AIGateway.instance;
  }

  public getSTTProvider(): SpeechToTextProvider {
    return this.sttProvider;
  }

  public getTranslationProvider(): TranslationProvider {
    return this.translationProvider;
  }

  public getTTSProvider(): TextToSpeechProvider {
    return this.ttsProvider;
  }

  public getLanguageDetectionProvider(): LanguageDetectionProvider {
    return this.languageDetectionProvider;
  }
}

export const aiGateway = AIGateway.getInstance();
