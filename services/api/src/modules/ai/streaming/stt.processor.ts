import { LanguageCode, TranscriptEvent } from '@lingualink/types';
import { aiGateway } from '../ai.gateway';
import { VADProcessor } from './vad.processor';

export interface STTProcessorResult {
  transcriptEvent: TranscriptEvent;
  requiresLanguageConfirmation: boolean;
}

export class StreamingSTTProcessor {
  private vad = new VADProcessor();
  private confidenceThreshold = parseFloat(
    process.env.AUTO_LANGUAGE_DETECTION_CONFIDENCE_THRESHOLD || '0.75'
  );

  public async *processAudioStream(
    audioStream: AsyncIterable<Buffer>,
    configuredLanguage: LanguageCode
  ): AsyncIterable<STTProcessorResult> {
    const sttProvider = aiGateway.getSTTProvider();

    // Stream audio frames through STT provider
    for await (const transcriptEvent of sttProvider.transcribeStream(audioStream, {
      language: configuredLanguage,
      autoDetectLanguage: true,
      interimResults: true,
    })) {
      const confidence = transcriptEvent.confidence;
      const requiresLanguageConfirmation = confidence < this.confidenceThreshold;

      yield {
        transcriptEvent,
        requiresLanguageConfirmation,
      };
    }
  }
}
