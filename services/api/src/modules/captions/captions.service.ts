import { LiveCaption, LanguageCode } from '@lingualink/types';
import { SignalingEventType } from '@lingualink/realtime-events';
import { signalingGateway } from '../../main';

export class CaptionsService {
  public static createDualCaption(
    callId: string,
    speakerId: string,
    speakerName: string,
    originalText: string,
    originalLanguage: LanguageCode,
    translatedText: string,
    targetLanguage: LanguageCode,
    isPartial: boolean = false,
    confidence: number = 0.95
  ): LiveCaption {
    const caption: LiveCaption = {
      id: `cap_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      callId,
      speakerId,
      speakerName,
      originalText,
      originalLanguage,
      translatedText,
      targetLanguage,
      isPartial,
      confidence,
      timestamp: Date.now(),
    };

    // Broadcast caption update to active call participants via Signaling Gateway
    if (signalingGateway) {
      signalingGateway.broadcastToRoom(callId, {
        event: SignalingEventType.CAPTION_UPDATE,
        payload: caption,
        timestamp: Date.now(),
      });
    }

    return caption;
  }
}
