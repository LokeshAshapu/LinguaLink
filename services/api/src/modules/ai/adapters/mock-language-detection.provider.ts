import { LanguageDetectionProvider, LanguageDetectionResult, LanguageCode } from '@lingualink/types';

export class MockLanguageDetectionProvider implements LanguageDetectionProvider {
  public name = 'MockLanguageDetectionProvider';

  public async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    const trimmed = text.trim();

    // Check Unicode ranges for Telugu & Devanagari (Hindi) script
    const hasTelugu = /[\u0C00-\u0C7F]/.test(trimmed);
    const hasDevanagari = /[\u0900-\u097F]/.test(trimmed);

    let detectedLanguage: LanguageCode = 'en-US';
    let confidence = 0.95;

    if (hasTelugu) {
      detectedLanguage = 'te-IN';
      confidence = 0.99;
    } else if (hasDevanagari) {
      detectedLanguage = 'hi-IN';
      confidence = 0.99;
    }

    return {
      detectedLanguage,
      confidence,
    };
  }
}
