import { VADProcessor } from '../modules/ai/streaming/vad.processor';
import { StreamingSTTProcessor } from '../modules/ai/streaming/stt.processor';

describe('Streaming STT & Voice Activity Detection (VAD)', () => {
  it('should detect silence and active speech correctly using VADProcessor', () => {
    const vad = new VADProcessor();

    // Silent buffer (all zeros)
    const silentBuffer = Buffer.alloc(320, 0);
    const silentResult = vad.processFrame(silentBuffer);
    expect(silentResult.isSpeech).toBe(false);
    expect(silentResult.energyLevel).toBe(0);

    // Active speech buffer (non-zero PCM sample values)
    const speechBuffer = Buffer.alloc(320);
    for (let i = 0; i < speechBuffer.length; i += 2) {
      speechBuffer.writeInt16LE(5000, i);
    }
    const speechResult = vad.processFrame(speechBuffer);
    expect(speechResult.isSpeech).toBe(true);
    expect(speechResult.energyLevel).toBeGreaterThan(10);
  });

  it('should stream interim and final STT transcripts with confidence evaluation', async () => {
    const processor = new StreamingSTTProcessor();

    async function* mockAudioStream() {
      yield Buffer.alloc(320, 100);
      yield Buffer.alloc(320, 100);
      yield Buffer.alloc(320, 100);
    }

    const results = [];
    for await (const res of processor.processAudioStream(mockAudioStream(), 'te-IN')) {
      results.push(res);
    }

    expect(results.length).toBe(3);
    expect(results[2].transcriptEvent.isFinal).toBe(true);
    expect(results[2].transcriptEvent.text).toBe('మీరు ఎలా ఉన్నారు?');
    expect(results[2].requiresLanguageConfirmation).toBe(false); // Confidence 0.96 >= 0.75
  });
});
