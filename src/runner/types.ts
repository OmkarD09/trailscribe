export interface AudioTranscriptionResult {
  text: string;
  durationSeconds: number;
  confidence: number;
}

export interface ExtractedFieldEntities {
  rawTranscript: string;
  speciesCandidates: string[];
  commonName?: string;
  scientificName?: string;
  kingdomOrGroup?: 'Fungi' | 'Plantae' | 'Animalia' | 'Insecta' | 'Aves' | 'Geology' | 'Other';
  habitat?: string;
  substrate?: string;
  abundanceCount?: number;
  lifeStage?: 'juvenile' | 'adult' | 'fruiting_body' | 'seedling' | 'flowering' | 'unknown';
  weatherObservation?: string;
  fieldNotes?: string;
}

export type RunnerStatus = 'idle' | 'loading_model' | 'ready' | 'processing' | 'error';

export interface ModelRunnerProgress {
  stage: string;
  progressPercent: number;
}

export interface ModelRunnerInterface {
  readonly id: string;
  readonly name: string;
  readonly status: RunnerStatus;
  readonly isReady: boolean;

  initialize(onProgress?: (progress: ModelRunnerProgress) => void): Promise<void>;
  transcribeAudio(audioBlob: Blob): Promise<AudioTranscriptionResult>;
  extractFieldEntities(transcript: string): Promise<ExtractedFieldEntities>;
  generateEmbedding(text: string): Promise<number[]>;
}
