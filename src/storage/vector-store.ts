import type { VectorSearchResult } from './types.ts';
import { db } from './db.ts';

/**
 * Computes cosine similarity between two numeric vectors.
 * Returns a value between -1.0 and 1.0 (typically 0.0 to 1.0 for normalized text embeddings).
 */
export function cosineSimilarity(a: number[] | Float32Array, b: number[] | Float32Array): number {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  
  return dotProduct / denominator;
}

export class OfflineVectorStore {
  /**
   * Searches local IndexedDB observations using vector cosine similarity.
   * Runs completely in memory with zero network calls.
   */
  static async search(
    queryEmbedding: number[] | Float32Array,
    options: { topK?: number; minScore?: number; kingdomFilter?: string } = {}
  ): Promise<VectorSearchResult[]> {
    const topK = options.topK ?? 10;
    const minScore = options.minScore ?? 0.15; // Lenient threshold for exploratory searches
    const kingdom = options.kingdomFilter;

    const allObservations = await db.getAllObservations();
    const scoredResults: VectorSearchResult[] = [];

    for (const obs of allObservations) {
      if (!obs.embedding || obs.embedding.length === 0) continue;
      if (kingdom && obs.kingdomOrGroup !== kingdom) continue;

      const score = cosineSimilarity(queryEmbedding, obs.embedding);
      if (score >= minScore) {
        scoredResults.push({
          observation: obs,
          similarityScore: score
        });
      }
    }

    // Sort descending by similarity score
    scoredResults.sort((a, b) => b.similarityScore - a.similarityScore);
    return scoredResults.slice(0, topK);
  }

  /**
   * High-speed offline hybrid search: combines tokenized semantic scoring
   * with vector cosine similarity across all cataloged observations.
   * Operates completely in-memory with zero network calls.
   */
  static async searchByText(
    queryText: string,
    options: { topK?: number; minScore?: number; kingdomFilter?: string } = {}
  ): Promise<VectorSearchResult[]> {
    const trimmed = queryText.trim().toLowerCase();
    if (!trimmed) {
      const all = await db.getAllObservations();
      const filtered = options.kingdomFilter && options.kingdomFilter !== 'all'
        ? all.filter((o) => o.kingdomOrGroup === options.kingdomFilter)
        : all;
      return filtered.slice(0, options.topK ?? 20).map((obs) => ({
        observation: obs,
        similarityScore: 1.0
      }));
    }

    const topK = options.topK ?? 15;
    const minScore = options.minScore ?? 0.08;
    const kingdom = options.kingdomFilter && options.kingdomFilter !== 'all' ? options.kingdomFilter : undefined;
    const allObservations = await db.getAllObservations();

    // Tokenize search query into meaningful words (excluding short noise)
    const queryTokens = trimmed.split(/\s+/).filter((t) => t.length > 1);
    const scoredResults: VectorSearchResult[] = [];

    for (const obs of allObservations) {
      if (kingdom && obs.kingdomOrGroup !== kingdom) continue;

      let score = 0;
      const common = (obs.commonName || '').toLowerCase();
      const sci = (obs.scientificName || '').toLowerCase();
      const habitat = (obs.habitat || '').toLowerCase();
      const substrate = (obs.substrate || '').toLowerCase();
      const notes = (obs.fieldNotes || '').toLowerCase();
      const kGroup = (obs.kingdomOrGroup || '').toLowerCase();
      const candidates = (obs.speciesCandidates || []).map((c) => c.toLowerCase()).join(' ');

      // Exact substring boost
      if (common.includes(trimmed)) score += 0.85;
      if (sci.includes(trimmed)) score += 0.80;
      if (candidates.includes(trimmed)) score += 0.65;
      if (habitat.includes(trimmed)) score += 0.45;
      if (substrate.includes(trimmed)) score += 0.40;
      if (notes.includes(trimmed)) score += 0.35;
      if (kGroup.includes(trimmed)) score += 0.30;

      // Token overlap scoring
      for (const token of queryTokens) {
        if (common.includes(token)) score += 0.35;
        if (sci.includes(token)) score += 0.30;
        if (candidates.includes(token)) score += 0.25;
        if (habitat.includes(token)) score += 0.20;
        if (substrate.includes(token)) score += 0.18;
        if (notes.includes(token)) score += 0.15;
        if (kGroup.includes(token)) score += 0.12;
      }

      // If observation already has an offline embedding, add normalized vector similarity bonus
      if (obs.embedding && obs.embedding.length > 0) {
        // Pseudo-hash query tokens into synthetic 384-dim probe to measure vector alignment
        const probe = new Float32Array(obs.embedding.length);
        for (let i = 0; i < queryTokens.length; i++) {
          const charCode = queryTokens[i].charCodeAt(0) % obs.embedding.length;
          probe[charCode] += 0.5;
        }
        const vecBonus = cosineSimilarity(probe, obs.embedding);
        if (vecBonus > 0) score += vecBonus * 0.25;
      }

      // Normalize score between 0.0 and 1.0
      const normalizedScore = Math.min(1.0, Math.round(score * 100) / 100);

      if (normalizedScore >= minScore) {
        scoredResults.push({
          observation: obs,
          similarityScore: normalizedScore
        });
      }
    }

    scoredResults.sort((a, b) => b.similarityScore - a.similarityScore);
    return scoredResults.slice(0, topK);
  }
}
