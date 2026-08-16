import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { CallsService } from './calls.service';
import { LiveKitService } from '../signaling/livekit.service';
import { db } from '../../shared/database';

export const callsRouter: Router = Router();

// Initiate a call to another user
callsRouter.post('/initiate', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const callerId = req.user?.userId;
  const { receiverId } = req.body;

  if (!callerId) return res.status(401).json({ error: 'Unauthorized' });
  if (!receiverId) return res.status(400).json({ error: 'Validation Error', message: 'receiverId is required' });

  if (callerId === receiverId) {
    return res.status(400).json({ error: 'Invalid Request', message: 'Cannot call yourself' });
  }

  try {
    const { call, callerParticipant, receiverParticipant } = CallsService.createCall(callerId, receiverId);
    const caller = db.users.get(callerId)!;
    const roomTokens = LiveKitService.generateRoomToken(call.id, callerId, caller.displayName);

    return res.status(201).json({
      call,
      callerParticipant,
      receiverParticipant,
      livekitToken: roomTokens.token,
      livekitUrl: roomTokens.url,
    });
  } catch (error: any) {
    return res.status(400).json({ error: 'Call Initiation Failed', message: error.message });
  }
});

// Accept an incoming call
callsRouter.post('/:id/accept', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const callId = req.params.id;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const updatedCall = CallsService.updateCallStatus(callId, 'CONNECTED');
    const user = db.users.get(userId)!;
    const roomTokens = LiveKitService.generateRoomToken(callId, userId, user.displayName);

    return res.json({
      call: updatedCall,
      livekitToken: roomTokens.token,
      livekitUrl: roomTokens.url,
    });
  } catch (error: any) {
    return res.status(400).json({ error: 'Accept Call Failed', message: error.message });
  }
});

// Reject an incoming call
callsRouter.post('/:id/reject', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const callId = req.params.id;

  try {
    const updatedCall = CallsService.updateCallStatus(callId, 'ENDED');
    return res.json({ call: updatedCall });
  } catch (error: any) {
    return res.status(400).json({ error: 'Reject Call Failed', message: error.message });
  }
});

// End an active call
callsRouter.post('/:id/end', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const callId = req.params.id;

  try {
    const updatedCall = CallsService.updateCallStatus(callId, 'ENDED');
    return res.json({ call: updatedCall });
  } catch (error: any) {
    return res.status(400).json({ error: 'End Call Failed', message: error.message });
  }
});

// Get user call history
callsRouter.get('/history', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const history = CallsService.getCallHistory(userId);
  return res.json({ calls: history });
});
