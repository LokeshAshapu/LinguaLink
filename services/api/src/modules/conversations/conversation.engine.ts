import { LanguageCode } from '@lingualink/types';

export interface TurnContext {
  speakerId: string;
  speakerName: string;
  sourceLanguage: LanguageCode;
  originalText: string;
  targetLanguage: LanguageCode;
  translatedText: string;
  timestamp: number;
}

export class ConversationContextEngine {
  private activeContexts: Map<string, TurnContext[]> = new Map(); // callId -> TurnContext[]
  private maxRollingTurns = 10;

  /**
   * Appends a conversational turn to the call's short-term rolling context window.
   */
  public addTurn(callId: string, turn: TurnContext): void {
    let turns = this.activeContexts.get(callId) || [];
    turns.push(turn);

    // Maintain rolling context window limit
    if (turns.length > this.maxRollingTurns) {
      turns = turns.slice(turns.length - this.maxRollingTurns);
    }

    this.activeContexts.set(callId, turns);
  }

  /**
   * Retrieves recent conversation context phrases for AI translation prompt enrichment.
   */
  public getContextPhrases(callId: string): string[] {
    const turns = this.activeContexts.get(callId) || [];
    return turns.map((t) => `${t.speakerName} (${t.sourceLanguage}): "${t.originalText}" -> "${t.translatedText}"`);
  }

  /**
   * Immediately destroys in-memory conversation context when call ends (Zero Retention Policy).
   */
  public destroyContext(callId: string): boolean {
    const existed = this.activeContexts.has(callId);
    this.activeContexts.delete(callId);
    if (existed) {
      console.log(`🧹 Conversation Engine: Ephemeral context destroyed for call ${callId}`);
    }
    return existed;
  }
}

export const conversationEngine = new ConversationContextEngine();
