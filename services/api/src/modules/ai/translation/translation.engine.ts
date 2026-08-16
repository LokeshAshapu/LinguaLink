import { LanguageCode, TranslationResult } from '@lingualink/types';
import { aiGateway } from '../ai.gateway';
import { LanguageValidator } from './language.validator';

export interface TranslationEngineOptions {
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  context?: string[];
}

export class TranslationEngine {
  public async translateText(
    text: string,
    options: TranslationEngineOptions
  ): Promise<{ result: TranslationResult; mode: 'VOICE_TRANSLATION' | 'TEXT_FALLBACK' | 'ORIGINAL' }> {
    const sourceLang = LanguageValidator.normalizeLanguageCode(options.sourceLanguage);
    const targetLang = LanguageValidator.normalizeLanguageCode(options.targetLanguage);

    if (sourceLang === targetLang) {
      return {
        result: {
          translatedText: text,
          detectedSourceLanguage: sourceLang,
          confidence: 1.0,
          latencyMs: 0,
        },
        mode: 'ORIGINAL',
      };
    }

    const provider = aiGateway.getTranslationProvider();

    // Circuit Breaker wrapped translation execution with Fallback hierarchy
    try {
      const result = await aiGateway.circuitBreaker.execute(
        async () => {
          return await provider.translate({
            text,
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
            context: options.context,
          });
        },
        async () => {
          // Fallback Strategy Stage 3: Text Translation + Captions
          console.warn('⚠️ Primary Translation Provider failed: Activating Text Fallback Mode');
          return {
            translatedText: `[Caption Fallback]: ${text}`,
            detectedSourceLanguage: sourceLang,
            confidence: 0.5,
            latencyMs: 5,
          };
        }
      );

      const mode = result.confidence < 0.6 ? 'TEXT_FALLBACK' : 'VOICE_TRANSLATION';
      return { result, mode };
    } catch (err) {
      // Fallback Strategy Stage 4: Original Audio
      return {
        result: {
          translatedText: text,
          detectedSourceLanguage: sourceLang,
          confidence: 0.0,
          latencyMs: 0,
        },
        mode: 'ORIGINAL',
      };
    }
  }
}
