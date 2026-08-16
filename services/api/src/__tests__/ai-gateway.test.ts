import { aiGateway } from '../modules/ai/ai.gateway';
import { AICostControl } from '../modules/ai/ai.cost-control';

describe('AI Gateway Abstraction & Provider Adapters', () => {
  it('should transcribe audio stream using MockSTTProvider with Telugu language option', async () => {
    const stt = aiGateway.getSTTProvider();
    expect(stt.name).toBe('MockSTTProvider');

    async function* dummyAudioGenerator() {
      yield Buffer.from([0x1, 0x2, 0x3]);
      yield Buffer.from([0x4, 0x5, 0x6]);
      yield Buffer.from([0x7, 0x8, 0x9]);
    }

    const events = [];
    for await (const event of stt.transcribeStream(dummyAudioGenerator(), { language: 'te-IN' })) {
      events.push(event);
    }

    expect(events.length).toBe(3);
    expect(events[2].isFinal).toBe(true);
    expect(events[2].text).toBe('మీరు ఎలా ఉన్నారు?');
    expect(events[2].detectedLanguage).toBe('te-IN');
  });

  it('should translate Telugu to Hindi accurately using MockTranslationProvider', async () => {
    const translator = aiGateway.getTranslationProvider();
    const result = await translator.translate({
      text: 'మీరు ఎలా ఉన్నారు?',
      sourceLanguage: 'te-IN',
      targetLanguage: 'hi-IN',
    });

    expect(result.translatedText).toBe('आप कैसे हैं?');
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('should synthesize audio frame chunks using MockTTSProvider', async () => {
    const tts = aiGateway.getTTSProvider();
    const chunks = [];
    for await (const chunk of tts.synthesizeStream({ text: 'आप कैसे हैं?', targetLanguage: 'hi-IN' })) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBe(3);
    expect(chunks[2].isFinal).toBe(true);
    expect(chunks[2].audioBuffer).toBeDefined();
  });

  it('should detect Telugu and Hindi scripts accurately using MockLanguageDetectionProvider', async () => {
    const detector = aiGateway.getLanguageDetectionProvider();

    const teluguResult = await detector.detectLanguage('మీరు ఎలా ఉన్నారు?');
    expect(teluguResult.detectedLanguage).toBe('te-IN');
    expect(teluguResult.confidence).toBeGreaterThan(0.95);

    const hindiResult = await detector.detectLanguage('आप कैसे हैं?');
    expect(hindiResult.detectedLanguage).toBe('hi-IN');
    expect(hindiResult.confidence).toBeGreaterThan(0.95);
  });

  it('should enforce Cost Control request tracking', () => {
    const callId = 'call_cost_test_1';
    const isAllowed = AICostControl.trackRequest(callId);
    expect(isAllowed).toBe(true);
    AICostControl.clearCall(callId);
  });
});
