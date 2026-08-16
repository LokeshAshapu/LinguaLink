import { CaptionsService } from '../modules/captions/captions.service';

describe('Captions Engine & Live Dual Captions', () => {
  it('should generate dual live captions for Telugu speaker and Hindi listener', () => {
    const caption = CaptionsService.createDualCaption(
      'call_caption_test_1',
      'usr_telugu_001',
      'Ramesh',
      'మీరు ఎలా ఉన్నారు?',
      'te-IN',
      'आप कैसे हैं?',
      'hi-IN',
      false,
      0.98
    );

    expect(caption).toBeDefined();
    expect(caption.originalText).toBe('మీరు ఎలా ఉన్నారు?');
    expect(caption.originalLanguage).toBe('te-IN');
    expect(caption.translatedText).toBe('आप कैसे हैं?');
    expect(caption.targetLanguage).toBe('hi-IN');
    expect(caption.speakerName).toBe('Ramesh');
    expect(caption.isPartial).toBe(false);
  });
});
