import type { VectorSearchResult } from './types';
import { db } from './db';

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
}
