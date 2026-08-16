import { TranslationEngine } from '../modules/ai/translation/translation.engine';
import { LanguageValidator } from '../modules/ai/translation/language.validator';

describe('Translation Engine & Language Pair Routing', () => {
  it('should normalize language aliases to standard locale codes', () => {
    expect(LanguageValidator.normalizeLanguageCode('telugu')).toBe('te-IN');
    expect(LanguageValidator.normalizeLanguageCode('hindi')).toBe('hi-IN');
    expect(LanguageValidator.normalizeLanguageCode('english')).toBe('en-US');
    expect(LanguageValidator.normalizeLanguageCode('tamil')).toBe('ta-IN');
  });

  it('should validate language pairs accurately', () => {
    expect(LanguageValidator.isValidLanguagePair('te-IN', 'hi-IN')).toBe(true);
    expect(LanguageValidator.isValidLanguagePair('te-IN', 'te-IN')).toBe(false);
  });

  it('should translate Telugu to Hindi with VOICE_TRANSLATION mode', async () => {
    const engine = new TranslationEngine();
    const { result, mode } = await engine.translateText('మీరు ఎలా ఉన్నారు?', {
      sourceLanguage: 'te-IN',
      targetLanguage: 'hi-IN',
    });

    expect(result.translatedText).toBe('आप कैसे हैं?');
    expect(mode).toBe('VOICE_TRANSLATION');
  });

  it('should return ORIGINAL mode when source and target languages are identical', async () => {
    const engine = new TranslationEngine();
    const { result, mode } = await engine.translateText('మీరు ఎలా ఉన్నారు?', {
      sourceLanguage: 'te-IN',
      targetLanguage: 'te-IN',
    });

    expect(result.translatedText).toBe('మీరు ఎలా ఉన్నారు?');
    expect(mode).toBe('ORIGINAL');
  });
});
