export interface VADResult {
  isSpeech: boolean;
  energyLevel: number;
}

export class VADProcessor {
  private energyThreshold = 10;

  /**
   * Evaluates a PCM audio buffer frame to detect human voice activity.
   */
  public processFrame(pcmBuffer: Buffer): VADResult {
    if (!pcmBuffer || pcmBuffer.length === 0) {
      return { isSpeech: false, energyLevel: 0 };
    }

    let sumSquares = 0;
    for (let i = 0; i < pcmBuffer.length; i += 2) {
      const sample = pcmBuffer.readInt16LE(i);
      sumSquares += sample * sample;
    }

    const rms = Math.sqrt(sumSquares / (pcmBuffer.length / 2));
    const energyLevel = Math.min(100, Math.floor(rms / 100));
    const isSpeech = energyLevel >= this.energyThreshold;

    return {
      isSpeech,
      energyLevel,
    };
  }
}
