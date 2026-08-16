import { SpeechToTextProvider, STTOptions, TranscriptEvent, LanguageCode } from '@lingualink/types';

export class MockSTTProvider implements SpeechToTextProvider {
  public name = 'MockSTTProvider';

  public async *transcribeStream(
    audioStream: AsyncIterable<Buffer>,
    options: STTOptions
  ): AsyncIterable<TranscriptEvent> {
    let chunkCount = 0;
    const defaultLanguage: LanguageCode = options.language || 'te-IN';

    for await (const buffer of audioStream) {
      chunkCount++;
      const isFinal = chunkCount >= 3;

      const mockText =
        defaultLanguage === 'te-IN'
          ? isFinal
            ? 'మీరు ఎలా ఉన్నారు?'
            : 'మీరు ఎలా...'
          : defaultLanguage === 'hi-IN'
          ? isFinal
            ? 'आप कैसे हैं?'
            : 'आप कैसे...'
          : isFinal
          ? 'How are you?'
          : 'How are...';

      yield {
        text: mockText,
        isFinal,
        detectedLanguage: defaultLanguage,
        confidence: isFinal ? 0.96 : 0.75,
        timestamp: Date.now(),
      };

      if (isFinal) break;
    }
  }
}
