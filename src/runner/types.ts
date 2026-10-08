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

export interface NaturalistInsightResult {
  nativeStatus: string;
  ecologicalRole?: string;
  foragingNotes?: string;
  seasonalIndicators: string;
  conservationStatus?: string;
  naturalistTips?: string;
  rawInsight?: string;
  modelUsed?: string;
}

export interface ExpeditionDispatchResult {
  title: string;
  story: string;
  excerpt: string;
  modelUsed: string;
}

export interface GemmaQueryResult {
  text: string;
  thoughts?: string;
  latencyMs: number;
  modelUsed: string;
  tokensUsed?: number;
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
  queryNaturalistContext?(specimenName: string, scientificName?: string): Promise<NaturalistInsightResult>;
  generateExpeditionDispatch?(summary: {
    minutes: number;
    distanceKm: number;
    discoveriesCount: number;
    phoneFreePercent: number;
    specimens: Array<{ commonName?: string; scientificName?: string; habitat?: string }>;
    trailName?: string;
  }): Promise<ExpeditionDispatchResult>;
}
