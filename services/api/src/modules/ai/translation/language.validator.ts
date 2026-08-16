import { LanguageCode } from '@lingualink/types';
import { SUPPORTED_LANGUAGES } from '@lingualink/config';

export class LanguageValidator {
  private static localeAliasMap: Record<string, LanguageCode> = {
    te: 'te-IN',
    telugu: 'te-IN',
    hi: 'hi-IN',
    hindi: 'hi-IN',
    en: 'en-US',
    english: 'en-US',
    ta: 'ta-IN',
    tamil: 'ta-IN',
    kn: 'kn-IN',
    kannada: 'kn-IN',
    ml: 'ml-IN',
    malayalam: 'ml-IN',
    bn: 'bn-IN',
    bengali: 'bn-IN',
    mr: 'mr-IN',
    marathi: 'mr-IN',
  };

  public static normalizeLanguageCode(code: string): LanguageCode {
    if (!code) return 'te-IN';
    const lower = code.toLowerCase().trim();
    if (this.localeAliasMap[lower]) {
      return this.localeAliasMap[lower];
    }
    if (SUPPORTED_LANGUAGES[code as LanguageCode]) {
      return code as LanguageCode;
    }
    return 'te-IN'; // Default fallback
  }

  public static isValidLanguagePair(source: LanguageCode, target: LanguageCode): boolean {
    return (
      Boolean(SUPPORTED_LANGUAGES[source]) &&
      Boolean(SUPPORTED_LANGUAGES[target]) &&
      source !== target
    );
  }
}
