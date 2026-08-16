import { conversationEngine } from '../modules/conversations/conversation.engine';

describe('Conversation Intelligence Engine & Privacy Destruction', () => {
  it('should maintain short-term rolling context window per call', () => {
    const callId = 'call_context_test_100';

    conversationEngine.addTurn(callId, {
      speakerId: 'usr_telugu_001',
      speakerName: 'Ramesh',
      sourceLanguage: 'te-IN',
      originalText: 'మీరు ఎలా ఉన్నారు?',
      targetLanguage: 'hi-IN',
      translatedText: 'आप कैसे हैं?',
      timestamp: Date.now(),
    });

    const phrases = conversationEngine.getContextPhrases(callId);
    expect(phrases.length).toBe(1);
    expect(phrases[0]).toContain('Ramesh (te-IN): "మీరు ఎలా ఉన్నారు?" -> "आप कैसे हैं?"');
  });

  it('should enforce rolling turn limits (max 10 turns)', () => {
    const callId = 'call_rolling_limit_test';

    for (let i = 1; i <= 15; i++) {
      conversationEngine.addTurn(callId, {
        speakerId: `usr_${i}`,
        speakerName: `Speaker ${i}`,
        sourceLanguage: 'te-IN',
        originalText: `Sentence ${i}`,
        targetLanguage: 'hi-IN',
        translatedText: `Translation ${i}`,
        timestamp: Date.now(),
      });
    }

    const phrases = conversationEngine.getContextPhrases(callId);
    expect(phrases.length).toBe(10); // Window capped at 10 turns
    expect(phrases[0]).toContain('Speaker 6'); // Oldest turns 1-5 dropped
  });

  it('should destroy ephemeral conversation context when call ends', () => {
    const callId = 'call_privacy_destroy_test';

    conversationEngine.addTurn(callId, {
      speakerId: 'usr_telugu_001',
      speakerName: 'Ramesh',
      sourceLanguage: 'te-IN',
      originalText: 'నమస్కారం',
      targetLanguage: 'hi-IN',
      translatedText: 'नमस्ते',
      timestamp: Date.now(),
    });

    expect(conversationEngine.getContextPhrases(callId).length).toBe(1);

    const destroyed = conversationEngine.destroyContext(callId);
    expect(destroyed).toBe(true);
    expect(conversationEngine.getContextPhrases(callId).length).toBe(0);
  });
});
