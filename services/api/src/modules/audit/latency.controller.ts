import { Router, Request, Response } from 'express';
import { LatencyService } from './latency.service';
import { LATENCY_TARGETS } from '@lingualink/config';

export const latencyRouter: Router = Router();

// Get real-time latency metrics breakdown
latencyRouter.get('/latency', (req: Request, res: Response) => {
  const averages = LatencyService.getAverageLatency();
  return res.json({
    targets: LATENCY_TARGETS,
    metrics: averages,
    status: averages.avgTotalEndToEndMs <= LATENCY_TARGETS.TOTAL_END_TO_END_MS ? 'OPTIMAL' : 'DEGRADED',
  });
});
