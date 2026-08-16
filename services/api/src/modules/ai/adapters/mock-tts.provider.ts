import { TextToSpeechProvider, TTSInput, AudioChunk } from '@lingualink/types';

export class MockTTSProvider implements TextToSpeechProvider {
  public name = 'MockTTSProvider';

  public async *synthesizeStream(input: TTSInput): AsyncIterable<AudioChunk> {
    const totalChunks = 3;
    const dummyPCMData = Buffer.alloc(1024, 0xa5); // Synthetic PCM audio data

    for (let i = 1; i <= totalChunks; i++) {
      const isFinal = i === totalChunks;
      yield {
        audioBuffer: dummyPCMData,
        isFinal,
        timestamp: Date.now(),
      };
    }
  }
}
