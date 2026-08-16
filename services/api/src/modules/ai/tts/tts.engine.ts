import { LanguageCode, AudioChunk } from '@lingualink/types';
import { aiGateway } from '../ai.gateway';

export interface TTSSynthesisMetrics {
  firstByteLatencyMs: number;
  totalChunks: number;
  totalAudioBytes: number;
}

export class StreamingTTSEngine {
  public async *synthesizeAudioStream(
    text: string,
    targetLanguage: LanguageCode
  ): AsyncIterable<{ chunk: AudioChunk; metrics?: TTSSynthesisMetrics }> {
    const startTime = Date.now();
    const ttsProvider = aiGateway.getTTSProvider();

    let firstByteLatencyMs = 0;
    let totalChunks = 0;
    let totalAudioBytes = 0;

    for await (const chunk of ttsProvider.synthesizeStream({
      text,
      targetLanguage,
    })) {
      totalChunks++;
      totalAudioBytes += chunk.audioBuffer.length;

      if (totalChunks === 1) {
        firstByteLatencyMs = Date.now() - startTime;
      }

      const metrics: TTSSynthesisMetrics | undefined = chunk.isFinal
        ? {
            firstByteLatencyMs,
            totalChunks,
            totalAudioBytes,
          }
        : undefined;

      yield { chunk, metrics };
    }
  }
}
