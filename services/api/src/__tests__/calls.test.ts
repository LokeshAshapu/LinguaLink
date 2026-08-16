import { CallsService } from '../modules/calls/calls.service';
import { LiveKitService } from '../modules/signaling/livekit.service';

describe('Calls Engine & LiveKit Service', () => {
  it('should create a call between Telugu UserA and Hindi UserB', () => {
    const { call, callerParticipant, receiverParticipant } = CallsService.createCall(
      'usr_telugu_001',
      'usr_hindi_002'
    );

    expect(call).toBeDefined();
    expect(call.status).toBe('CALLING');
    expect(callerParticipant.sourceLanguage).toBe('te-IN');
    expect(receiverParticipant.sourceLanguage).toBe('hi-IN');
  });

  it('should transition call status accurately through CONNECTED and ENDED', () => {
    const { call } = CallsService.createCall('usr_telugu_001', 'usr_hindi_002');
    
    const connectedCall = CallsService.updateCallStatus(call.id, 'CONNECTED');
    expect(connectedCall.status).toBe('CONNECTED');
    expect(connectedCall.startedAt).toBeDefined();

    const endedCall = CallsService.updateCallStatus(call.id, 'ENDED');
    expect(endedCall.status).toBe('ENDED');
    expect(endedCall.endedAt).toBeDefined();
    expect(endedCall.duration).toBeGreaterThanOrEqual(0);
  });

  it('should generate valid LiveKit WebRTC room tokens', () => {
    const room = LiveKitService.generateRoomToken('call_12345', 'usr_telugu_001', 'Ramesh');
    expect(room.token).toBeDefined();
    expect(room.token.split('.').length).toBe(3); // Valid JWT structure
    expect(room.url).toBeDefined();
  });
});
