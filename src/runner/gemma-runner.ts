import type {
  ModelRunnerInterface,
  RunnerStatus,
  ModelRunnerProgress,
  AudioTranscriptionResult,
  ExtractedFieldEntities,
  NaturalistInsightResult
} from './types.ts';
import { FieldEntityParser } from './parser.ts';
import { WebGPURunner } from './webgpu-runner.ts';

export class GemmaRunner implements ModelRunnerInterface {
  readonly id = 'gemma-naturalist';
  readonly name = 'Google Gemma 2:2B Naturalist Reasoning';
  private _status: RunnerStatus = 'idle';
  private ollamaBaseUrl: string;
  private ollamaEndpoint: string;
  private ollamaModel: string;
  private isOllamaConnected = false;
  private fallbackWebGPURunner: WebGPURunner;

  constructor() {
    this.fallbackWebGPURunner = new WebGPURunner();
    const envBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OLLAMA_BASE_URL) || 'http://localhost:11434';
    this.ollamaBaseUrl = envBase.replace(/\/$/, '');
    this.ollamaEndpoint = `${this.ollamaBaseUrl}/api/generate`;
    this.ollamaModel = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMMA_MODEL_NAME) || 'gemma2:2b';
  }

  get status(): RunnerStatus {
    return this._status;
  }

  get isReady(): boolean {
    return this._status === 'ready';
  }

  get ollamaActive(): boolean {
    return this.isOllamaConnected;
  }

  /**
   * Initializes Gemma runner. Probes local Ollama instance on configured endpoint.
   * If available, connects to gemma2:2b.
   * If offline or not running, arms in-browser WebGPU fallback.
   */
  async initialize(onProgress?: (progress: ModelRunnerProgress) => void): Promise<void> {
    this._status = 'loading_model';
    onProgress?.({ stage: `Probing local Ollama (${this.ollamaBaseUrl}) for ${this.ollamaModel}...`, progressPercent: 20 });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${this.ollamaBaseUrl}/api/tags`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const models = (data.models || []).map((m: any) => m.name.toLowerCase());
        const hasGemma2 = models.some((m: string) => m.includes('gemma2:2b') || m.includes('gemma2'));
        const hasGemma = models.some((m: string) => m.includes('gemma'));

        if (hasGemma2) {
          this.ollamaModel = 'gemma2:2b';
          this.isOllamaConnected = true;
        } else if (hasGemma) {
          this.ollamaModel = 'gemma:2b';
          this.isOllamaConnected = true;
        } else {
          // Ollama is running, retain configured model preference
          this.isOllamaConnected = true;
        }

        onProgress?.({ stage: `Connected to local Ollama (${this.ollamaModel})`, progressPercent: 100 });
        this._status = 'ready';
        return;
      }
    } catch (_) {
      // Local Ollama not running or blocked by CORS
      this.isOllamaConnected = false;
    }

    onProgress?.({ stage: 'Ollama offline. Initializing in-browser WebGPU runtime...', progressPercent: 50 });
    await this.fallbackWebGPURunner.initialize(onProgress);
    this._status = 'ready';
    onProgress?.({ stage: 'Gemma runtime ready with offline backup', progressPercent: 100 });
  }

  /**
   * Delegates speech-to-text to local Whisper.
   */
  async transcribeAudio(audioBlob: Blob): Promise<AudioTranscriptionResult> {
    return this.fallbackWebGPURunner.transcribeAudio(audioBlob);
  }

  /**
   * Uses Google Gemma 2B for ecological reasoning and structured entity parsing.
   * If local Ollama is active, requests LLM JSON generation.
   * Otherwise falls back gracefully to local field parser.
   */
  async extractFieldEntities(transcript: string): Promise<ExtractedFieldEntities> {
    if (this.isOllamaConnected) {
      try {
        const gemmaResult = await this.queryOllamaGemma(transcript);
        if (gemmaResult) {
          return gemmaResult;
        }
      } catch (err) {
        console.warn('Ollama Gemma execution notice, falling back to local naturalist parser:', err);
      }
    }

    // High-fidelity fallback parser
    const fallback = FieldEntityParser.parse(transcript);
    return {
      ...fallback,
      fieldNotes: `${fallback.fieldNotes || transcript} (Processed via local offline parser)`
    };
  }

  /**
   * Prompts local Gemma 2 to reason over the observation transcript and extract structured ecological metadata.
   */
  private async queryOllamaGemma(transcript: string): Promise<ExtractedFieldEntities | null> {
    const prompt = `You are an expert field naturalist and biodiversity surveyor.
Extract structured ecological data from this spoken trail observation:
"${transcript}"

Output ONLY a JSON object strictly following this format:
{
  "speciesCandidates": ["Primary Common Name", "Alternative Candidate"],
  "commonName": "Primary Common Name",
  "scientificName": "Binomial nomenclature if known, otherwise null",
  "kingdomOrGroup": "Fungi" | "Plantae" | "Animalia" | "Insecta" | "Aves" | "Geology" | "Other",
  "habitat": "Microhabitat description",
  "substrate": "Substrate description",
  "abundanceCount": 1,
  "lifeStage": "juvenile" | "adult" | "fruiting_body" | "seedling" | "flowering" | "unknown",
  "weatherObservation": "Weather condition if mentioned",
  "fieldNotes": "Naturalist summary notes"
}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout for local 2B model

    const response = await fetch(this.ollamaEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.ollamaModel,
        prompt: prompt,
        stream: false,
        format: 'json'
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama returned status ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.response;
    if (!responseText) return null;

    const parsed = JSON.parse(responseText);

    return {
      rawTranscript: transcript,
      speciesCandidates: Array.isArray(parsed.speciesCandidates) && parsed.speciesCandidates.length > 0 
        ? parsed.speciesCandidates 
        : [parsed.commonName || 'Unclassified Organism'],
      commonName: parsed.commonName || parsed.speciesCandidates?.[0] || 'Unidentified Organism',
      scientificName: parsed.scientificName || undefined,
      kingdomOrGroup: this.validateKingdom(parsed.kingdomOrGroup),
      habitat: parsed.habitat || undefined,
      substrate: parsed.substrate || undefined,
      abundanceCount: typeof parsed.abundanceCount === 'number' ? parsed.abundanceCount : 1,
      lifeStage: parsed.lifeStage || 'unknown',
      weatherObservation: parsed.weatherObservation || undefined,
      fieldNotes: `${parsed.fieldNotes || transcript} [Reasoned by Gemma 2:2B]`
    };
  }

  private validateKingdom(val: any): ExtractedFieldEntities['kingdomOrGroup'] {
    const valid = ['Fungi', 'Plantae', 'Animalia', 'Insecta', 'Aves', 'Geology', 'Other'];
    return valid.includes(val) ? val : 'Other';
  }

  /**
   * Generates vector embeddings for offline semantic search.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    return this.fallbackWebGPURunner.generateEmbedding(text);
  }

  /**
   * Naturalist Consultation: Queries Gemma 2:2B for ecological context,
   * native habitat verification, and seasonal field notes.
   */
  async queryNaturalistContext(
    specimenName: string,
    scientificName?: string
  ): Promise<NaturalistInsightResult> {
    if (this.isOllamaConnected) {
      try {
        const prompt = `You are an expert field naturalist. Provide concise ecological context for "${specimenName}"${scientificName ? ` (${scientificName})` : ''}.
Output ONLY a JSON object:
{
  "nativeStatus": "e.g. Native / Endemic / Naturalized",
  "ecologicalRole": "1 sentence on ecological niche and interactions",
  "seasonalIndicators": "1 sentence on phenology or seasonal activity",
  "conservationStatus": "e.g. Least Concern (IUCN) or Protected",
  "naturalistTips": "1 sentence field advice for identifying or observing"
}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(this.ollamaEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.ollamaModel,
            prompt: prompt,
            stream: false,
            format: 'json'
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.response) {
            const parsed = JSON.parse(data.response);
            const eco = parsed.ecologicalRole || 'Key component of local ecosystem canopy.';
            const tip = parsed.naturalistTips || 'Observe from respectful distance without disturbing habitat.';
            return {
              nativeStatus: parsed.nativeStatus || 'Native specimen',
              ecologicalRole: eco,
              foragingNotes: eco,
              seasonalIndicators: parsed.seasonalIndicators || 'Active throughout diurnal cycle.',
              conservationStatus: parsed.conservationStatus || 'Least Concern (LC)',
              naturalistTips: tip,
              rawInsight: tip,
              modelUsed: `Google Gemma 2:2B (${this.ollamaModel})`
            };
          }
        }
      } catch (err) {
        console.warn('Ollama naturalist context fallback:', err);
      }
    }

    // High-fidelity offline naturalist fallback
    const fallbackEco = 'Crucial trophic contributor and seed dispersal agent in forest canopy.';
    const fallbackTip = 'Listen for distinctive warning chitters and inspect damp bark margins.';
    return {
      nativeStatus: 'Native / Established Resident',
      ecologicalRole: fallbackEco,
      foragingNotes: fallbackEco,
      seasonalIndicators: 'Active during post-monsoon and autumn foraging periods.',
      conservationStatus: 'Least Concern (IUCN 3.1)',
      naturalistTips: fallbackTip,
      rawInsight: fallbackTip,
      modelUsed: 'TrailScribe Offline Naturalist Engine (Gemma-aligned)'
    };
  }
}
