import { LatencyMetrics } from '@lingualink/types';
import { LATENCY_TARGETS } from '@lingualink/config';

export class LatencyService {
  private static metricsHistory: LatencyMetrics[] = [];

  public static recordLatency(
    callId: string,
    segmentId: string,
    timings: {
      audioCaptureMs: number;
      networkUploadMs: number;
      sttMs: number;
      translationMs: number;
      ttsMs: number;
      networkDeliveryMs: number;
      playbackMs: number;
    }
  ): LatencyMetrics {
    const totalEndToEndMs =
      timings.audioCaptureMs +
      timings.networkUploadMs +
      timings.sttMs +
      timings.translationMs +
      timings.ttsMs +
      timings.networkDeliveryMs +
      timings.playbackMs;

    const metrics: LatencyMetrics = {
      callId,
      segmentId,
      ...timings,
      totalEndToEndMs,
      timestamp: Date.now(),
    };

    this.metricsHistory.push(metrics);

    if (totalEndToEndMs > LATENCY_TARGETS.TOTAL_END_TO_END_MS) {
      console.warn(
        `⚡ Latency Target Exceeded for call ${callId}: Total ${totalEndToEndMs}ms (Target: <${LATENCY_TARGETS.TOTAL_END_TO_END_MS}ms)`
      );
    }

    return metrics;
  }

  public static getAverageLatency(): {
    avgSTTMs: number;
    avgTranslationMs: number;
    avgTTSMs: number;
    avgTotalEndToEndMs: number;
    sampleSize: number;
  } {
    if (this.metricsHistory.length === 0) {
      return {
        avgSTTMs: 0,
        avgTranslationMs: 0,
        avgTTSMs: 0,
        avgTotalEndToEndMs: 0,
        sampleSize: 0,
      };
    }

    const count = this.metricsHistory.length;
    const sumSTT = this.metricsHistory.reduce((acc, m) => acc + m.sttMs, 0);
    const sumTrans = this.metricsHistory.reduce((acc, m) => acc + m.translationMs, 0);
    const sumTTS = this.metricsHistory.reduce((acc, m) => acc + m.ttsMs, 0);
    const sumTotal = this.metricsHistory.reduce((acc, m) => acc + m.totalEndToEndMs, 0);

    return {
      avgSTTMs: Math.round(sumSTT / count),
      avgTranslationMs: Math.round(sumTrans / count),
      avgTTSMs: Math.round(sumTTS / count),
      avgTotalEndToEndMs: Math.round(sumTotal / count),
      sampleSize: count,
    };
  }
}
