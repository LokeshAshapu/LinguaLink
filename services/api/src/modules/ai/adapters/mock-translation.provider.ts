import { TranslationProvider, TranslationInput, TranslationResult } from '@lingualink/types';

export class MockTranslationProvider implements TranslationProvider {
  public name = 'MockTranslationProvider';

  private translationDictionary: Record<string, string> = {
    'మీరు ఎలా ఉన్నారు?_te-IN_hi-IN': 'आप कैसे हैं?',
    'మీరు ఎలా ఉన్నారు?_te-IN_en-US': 'How are you?',
    'आप कैसे हैं?_hi-IN_te-IN': 'మీరు ఎలా ఉన్నారు?',
    'आप कैसे हैं?_hi-IN_en-US': 'How are you?',
    'How are you?_en-US_hi-IN': 'आप कैसे हैं?',
    'How are you?_en-US_te-IN': 'మీరు ఎలా ఉన్నారు?',
    'నేను బాగున్నాను_te-IN_hi-IN': 'मैं ठीक हूँ',
    'मैं ठीक हूँ_hi-IN_te-IN': 'నేను బాగున్నాను',
  };

  public async translate(input: TranslationInput): Promise<TranslationResult> {
    const startTime = Date.now();
    const key = `${input.text.trim()}_${input.sourceLanguage}_${input.targetLanguage}`;

    let translatedText = this.translationDictionary[key];

    if (!translatedText) {
      // Fallback translation generation
      if (input.targetLanguage === 'hi-IN') {
        translatedText = `[हिंदी]: ${input.text}`;
      } else if (input.targetLanguage === 'te-IN') {
        translatedText = `[తెలుగు]: ${input.text}`;
      } else {
        translatedText = `[English]: ${input.text}`;
      }
    }

    return {
      translatedText,
      detectedSourceLanguage: input.sourceLanguage,
      confidence: 0.98,
      latencyMs: Date.now() - startTime,
    };
  }
}
