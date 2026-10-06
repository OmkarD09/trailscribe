export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface FieldObservation {
  id: string; // UUID v4
  timestamp: number; // Unix epoch ms
  readableDate: string; // ISO string or human formatted
  coordinates?: Coordinates;
  
  // Media Blobs
  audioBlob?: Blob;
  audioDurationSeconds?: number;
  photoBlob?: Blob;
  photoMimeType?: string;
  photoUrl?: string;
  
  // AI Inference & Naturalist Extraction
  rawTranscript?: string;
  speciesCandidates: string[];
  commonName?: string;
  scientificName?: string;
  confidenceScore?: number; // 0.0 to 1.0
  kingdomOrGroup?: 'Fungi' | 'Plantae' | 'Animalia' | 'Insecta' | 'Aves' | 'Geology' | 'Other';
  
  // Ecological Context
  habitat?: string; // e.g. "decaying birch log, north-facing damp slope"
  substrate?: string; // e.g. "bark", "soil", "granite rock"
  abundanceCount?: number;
  lifeStage?: 'juvenile' | 'adult' | 'fruiting_body' | 'seedling' | 'flowering' | 'unknown';
  weatherObservation?: string;
  fieldNotes?: string;
  
  // Offline Vector Embedding (384-dimensional for all-MiniLM-L6-v2)
  embedding?: number[];
  
  // Sync / Export Flags
  synced?: boolean;
  isFlaggedForFollowup?: boolean;
  exportedAt?: number | null;
}

export interface VectorSearchResult {
  observation: FieldObservation;
  similarityScore: number; // 0.0 to 1.0 (Cosine similarity)
}

export interface DarwinCoreRecord {
  occurrenceID: string;
  eventDate: string;
  decimalLatitude?: number;
  decimalLongitude?: number;
  coordinateUncertaintyInMeters?: number;
  vernacularName?: string;
  scientificName?: string;
  individualCount?: number;
  habitat?: string;
  lifeStage?: string;
  occurrenceRemarks?: string;
  basisOfRecord: 'HumanObservation';
  recordedBy: string;
  geodeticDatum: 'WGS84';
}
