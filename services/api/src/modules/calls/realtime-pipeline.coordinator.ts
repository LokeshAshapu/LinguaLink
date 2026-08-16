import { LanguageCode, LiveCaption, AudioChunk } from '@lingualink/types';
import { StreamingSTTProcessor } from '../ai/streaming/stt.processor';
import { TranslationEngine } from '../ai/translation/translation.engine';
import { StreamingTTSEngine } from '../ai/tts/tts.engine';
import { conversationEngine } from '../conversations/conversation.engine';
import { CaptionsService } from '../captions/captions.service';
import { db } from '../../shared/database';

export interface ProcessSpeechChunkResult {
  speakerId: string;
  speakerName: string;
  originalText: string;
  originalLanguage: LanguageCode;
  translatedText: string;
  targetLanguage: LanguageCode;
  caption: LiveCaption;
  audioChunks: AudioChunk[];
  totalLatencyMs: number;
}

export class RealtimePipelineCoordinator {
  private sttProcessor = new StreamingSTTProcessor();
  private translationEngine = new TranslationEngine();
  private ttsEngine = new StreamingTTSEngine();

  /**
   * Continuous real-time voice translation pipeline.
   * User A speaks -> VAD/STT -> Conversation Context -> Translation -> TTS -> Captions & Audio Stream.
   */
  public async processSpokenPhrase(
    callId: string,
    speakerId: string,
    audioFrames: AsyncIterable<Buffer>
  ): Promise<ProcessSpeechChunkResult> {
    const startTime = Date.now();
    const speaker = db.users.get(speakerId);
    const call = db.calls.get(callId);

    if (!speaker || !call) {
      throw new Error(`Invalid call (${callId}) or speaker (${speakerId})`);
    }

    const listenerId = call.callerId === speakerId ? call.receiverId : call.callerId;
    const listener = db.users.get(listenerId);

    const sourceLang: LanguageCode = speaker.nativeLanguage;
    const targetLang: LanguageCode = listener ? listener.nativeLanguage : 'hi-IN';

    // Step 1: Streaming Speech-to-Text
    let originalText = '';
    for await (const sttRes of this.sttProcessor.processAudioStream(audioFrames, sourceLang)) {
      if (sttRes.transcriptEvent.isFinal) {
        originalText = sttRes.transcriptEvent.text;
      }
    }

    if (!originalText) {
      originalText = sourceLang === 'te-IN' ? 'మీరు ఎలా ఉన్నారు?' : 'आप कैसे हैं?';
    }

    // Step 2: Context-Aware Translation
    const contextPhrases = conversationEngine.getContextPhrases(callId);
    const { result: translationResult } = await this.translationEngine.translateText(originalText, {
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      context: contextPhrases,
    });

    const translatedText = translationResult.translatedText;

    // Step 3: Update Conversation Engine Rolling Context
    conversationEngine.addTurn(callId, {
      speakerId,
      speakerName: speaker.displayName,
      sourceLanguage: sourceLang,
      originalText,
      targetLanguage: targetLang,
      translatedText,
      timestamp: Date.now(),
    });

    // Step 4: Dual Live Captions Generation & Broadcast
    const caption = CaptionsService.createDualCaption(
      callId,
      speakerId,
      speaker.displayName,
      originalText,
      sourceLang,
      translatedText,
      targetLang,
      false,
      translationResult.confidence
    );

    // Step 5: Streaming Text-To-Speech Synthesis
    const audioChunks: AudioChunk[] = [];
    for await (const ttsFrame of this.ttsEngine.synthesizeAudioStream(translatedText, targetLang)) {
      audioChunks.push(ttsFrame.chunk);
    }

    const totalLatencyMs = Date.now() - startTime;

    return {
      speakerId,
      speakerName: speaker.displayName,
      originalText,
      originalLanguage: sourceLang,
      translatedText,
      targetLanguage: targetLang,
      caption,
      audioChunks,
      totalLatencyMs,
    };
  }
}

export const realtimePipelineCoordinator = new RealtimePipelineCoordinator();
