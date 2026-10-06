import type {
  ModelRunnerInterface,
  RunnerStatus,
  ModelRunnerProgress,
  AudioTranscriptionResult,
  ExtractedFieldEntities
} from './types';
import { FieldEntityParser } from './parser';

export class MockModelRunner implements ModelRunnerInterface {
  readonly id = 'mock-runner';
  readonly name = 'Fast Deterministic Mock Runner';
  private _status: RunnerStatus = 'ready';

  get status(): RunnerStatus {
    return this._status;
  }

  get isReady(): boolean {
    return true;
  }

  async initialize(onProgress?: (progress: ModelRunnerProgress) => void): Promise<void> {
    onProgress?.({ stage: 'Mock runner ready instantly', progressPercent: 100 });
  }

  async transcribeAudio(_audioBlob: Blob): Promise<AudioTranscriptionResult> {
    return {
      text: 'Found a cluster of turkey tail mushrooms on a decaying birch log, damp mossy bank, roughly five specimens.',
      durationSeconds: 4.5,
      confidence: 0.98
    };
  }

  async extractFieldEntities(transcript: string): Promise<ExtractedFieldEntities> {
    return FieldEntityParser.parse(transcript);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const dimensions = 384;
    const vector = new Float32Array(dimensions);
    for (let i = 0; i < text.length; i++) {
      vector[i % dimensions] += (text.charCodeAt(i) % 10) / 10;
    }
    // Normalize
    let norm = 0;
    for (let i = 0; i < dimensions; i++) norm += vector[i] * vector[i];
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < dimensions; i++) vector[i] /= norm;
    return Array.from(vector);
  }
}
