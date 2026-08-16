import { CallsService } from '../modules/calls/calls.service';
import { realtimePipelineCoordinator } from '../modules/calls/realtime-pipeline.coordinator';
import { conversationEngine } from '../modules/conversations/conversation.engine';
import { db } from '../shared/database';

describe('Phase 10: End-to-End Multilingual Call Pipeline Simulation (Telugu ↔ Hindi)', () => {
  it('should execute a full bi-directional translated call session between User A (Telugu) and User B (Hindi)', async () => {
    // Step 1: User A (Ramesh - Telugu) initiates call to User B (Priya - Hindi)
    const callerId = 'usr_telugu_001';
    const receiverId = 'usr_hindi_002';

    const { call } = CallsService.createCall(callerId, receiverId);
    expect(call.status).toBe('CALLING');

    // Step 2: User B accepts call -> State becomes CONNECTED
    const connectedCall = CallsService.updateCallStatus(call.id, 'CONNECTED');
    expect(connectedCall.status).toBe('CONNECTED');

    // Step 3: User A speaks in Telugu ("మీరు ఎలా ఉన్నారు?")
    async function* audioStreamUserA() {
      yield Buffer.alloc(320, 100);
      yield Buffer.alloc(320, 100);
      yield Buffer.alloc(320, 100);
    }

    const pipelineResultUserA = await realtimePipelineCoordinator.processSpokenPhrase(
      call.id,
      callerId,
      audioStreamUserA()
    );

    // Verify User A -> User B Pipeline Result (Telugu -> Hindi)
    expect(pipelineResultUserA.originalText).toBe('మీరు ఎలా ఉన్నారు?');
    expect(pipelineResultUserA.originalLanguage).toBe('te-IN');
    expect(pipelineResultUserA.translatedText).toBe('आप कैसे हैं?');
    expect(pipelineResultUserA.targetLanguage).toBe('hi-IN');
    expect(pipelineResultUserA.caption.originalText).toBe('మీరు ఎలా ఉన్నారు?');
    expect(pipelineResultUserA.caption.translatedText).toBe('आप कैसे हैं?');
    expect(pipelineResultUserA.audioChunks.length).toBeGreaterThan(0);
    expect(pipelineResultUserA.totalLatencyMs).toBeLessThan(1000); // Sub-second target

    // Step 4: User B responds in Hindi ("आप कैसे हैं?")
    async function* audioStreamUserB() {
      yield Buffer.alloc(320, 100);
      yield Buffer.alloc(320, 100);
      yield Buffer.alloc(320, 100);
    }

    const pipelineResultUserB = await realtimePipelineCoordinator.processSpokenPhrase(
      call.id,
      receiverId,
      audioStreamUserB()
    );

    // Verify User B -> User A Reverse Pipeline Result (Hindi -> Telugu)
    expect(pipelineResultUserB.originalLanguage).toBe('hi-IN');
    expect(pipelineResultUserB.translatedText).toBe('మీరు ఎలా ఉన్నారు?');
    expect(pipelineResultUserB.targetLanguage).toBe('te-IN');
    expect(pipelineResultUserB.audioChunks.length).toBeGreaterThan(0);

    // Step 5: User ends call -> Verify ephemeral memory cleanup
    const endedCall = CallsService.updateCallStatus(call.id, 'ENDED');
    expect(endedCall.status).toBe('ENDED');

    const contextDestroyed = conversationEngine.destroyContext(call.id);
    expect(contextDestroyed).toBe(true);
    expect(conversationEngine.getContextPhrases(call.id).length).toBe(0);
  });
});
