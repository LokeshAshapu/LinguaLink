import { Call, CallStatus, CallParticipant, LanguageCode } from '@lingualink/types';
import { db } from '../../shared/database';

export class CallsService {
  public static createCall(callerId: string, receiverId: string): { call: Call; callerParticipant: CallParticipant; receiverParticipant: CallParticipant } {
    const caller = db.users.get(callerId);
    const receiver = db.users.get(receiverId);

    if (!caller || !receiver) {
      throw new Error('Caller or Receiver user does not exist');
    }

    const callId = `call_${Date.now()}`;
    const call: Call = {
      id: callId,
      callerId,
      receiverId,
      status: 'CALLING',
      createdAt: new Date().toISOString(),
    };

    const callerParticipant: CallParticipant = {
      id: `part_${Date.now()}_1`,
      callId,
      userId: callerId,
      role: 'CALLER',
      sourceLanguage: caller.nativeLanguage,
      targetLanguage: receiver.nativeLanguage,
      joinedAt: new Date().toISOString(),
    };

    const receiverParticipant: CallParticipant = {
      id: `part_${Date.now()}_2`,
      callId,
      userId: receiverId,
      role: 'RECEIVER',
      sourceLanguage: receiver.nativeLanguage,
      targetLanguage: caller.nativeLanguage,
    };

    db.calls.set(callId, call);

    return { call, callerParticipant, receiverParticipant };
  }

  public static updateCallStatus(callId: string, status: CallStatus): Call {
    const call = db.calls.get(callId);
    if (!call) {
      throw new Error(`Call ${callId} not found`);
    }

    call.status = status;

    if (status === 'CONNECTED' && !call.startedAt) {
      call.startedAt = new Date().toISOString();
    }

    if (status === 'ENDED' || status === 'FAILED') {
      call.endedAt = new Date().toISOString();
      if (call.startedAt) {
        const start = new Date(call.startedAt).getTime();
        const end = new Date(call.endedAt).getTime();
        call.duration = Math.max(0, Math.floor((end - start) / 1000));
      }
    }

    db.calls.set(callId, call);
    return call;
  }

  public static getCallHistory(userId: string): Call[] {
    return Array.from(db.calls.values()).filter(
      (call) => call.callerId === userId || call.receiverId === userId
    );
  }
}
