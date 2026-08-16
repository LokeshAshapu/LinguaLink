import { LatencyService } from '../modules/audit/latency.service';

describe('Latency Optimization & Per-Stage Telemetry', () => {
  it('should compute total end-to-end latency and verify sub-second target threshold', () => {
    const metrics = LatencyService.recordLatency('call_lat_100', 'seg_1', {
      audioCaptureMs: 50,
      networkUploadMs: 40,
      sttMs: 300,
      translationMs: 150,
      ttsMs: 250,
      networkDeliveryMs: 40,
      playbackMs: 50,
    });

    expect(metrics.totalEndToEndMs).toBe(880); // 880ms < 1000ms target
    expect(metrics.totalEndToEndMs).toBeLessThan(1000);
  });

  it('should calculate rolling averages across recorded metrics samples', () => {
    const averages = LatencyService.getAverageLatency();
    expect(averages.sampleSize).toBeGreaterThan(0);
    expect(averages.avgTotalEndToEndMs).toBe(880);
    expect(averages.avgSTTMs).toBe(300);
  });
});
