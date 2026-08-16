import { StreamingTTSEngine } from '../modules/ai/tts/tts.engine';

describe('Streaming TTS Engine & First-Byte Latency', () => {
  it('should stream audio chunks with valid first-byte latency metrics', async () => {
    const ttsEngine = new StreamingTTSEngine();
    const results = [];

    for await (const res of ttsEngine.synthesizeAudioStream('आप कैसे हैं?', 'hi-IN')) {
      results.push(res);
    }

    expect(results.length).toBeGreaterThan(0);
    const finalFrame = results[results.length - 1];

    expect(finalFrame.chunk.isFinal).toBe(true);
    expect(finalFrame.metrics).toBeDefined();
    expect(finalFrame.metrics?.firstByteLatencyMs).toBeLessThan(350); // Target first-byte latency < 350ms
    expect(finalFrame.metrics?.totalAudioBytes).toBeGreaterThan(0);
  });
});
