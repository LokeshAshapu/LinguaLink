import { ApiClient } from './client';
import { Call, CallParticipant } from '@lingualink/types';

export interface InitiateCallResponse {
  call: Call;
  callerParticipant: CallParticipant;
  receiverParticipant: CallParticipant;
  livekitToken: string;
  livekitUrl: string;
}

export interface AcceptCallResponse {
  call: Call;
  livekitToken: string;
  livekitUrl: string;
}

export interface CallStatusResponse {
  call: Call;
}

export const callsApi = {
  async initiateCall(receiverId: string): Promise<InitiateCallResponse> {
    console.log('[CALL] Initiating call to receiver:', receiverId);
    return ApiClient.post<InitiateCallResponse>('/calls/initiate', { receiverId });
  },

  async acceptCall(callId: string): Promise<AcceptCallResponse> {
    console.log('[CALL] Accepting call:', callId);
    return ApiClient.post<AcceptCallResponse>(`/calls/${callId}/accept`);
  },

  async rejectCall(callId: string): Promise<CallStatusResponse> {
    console.log('[CALL] Rejecting call:', callId);
    return ApiClient.post<CallStatusResponse>(`/calls/${callId}/reject`);
  },

  async endCall(callId: string): Promise<CallStatusResponse> {
    console.log('[CALL] Ending call:', callId);
    return ApiClient.post<CallStatusResponse>(`/calls/${callId}/end`);
  },

  async getHistory(): Promise<{ calls: Call[] }> {
    return ApiClient.get<{ calls: Call[] }>('/calls/history');
  },
};
