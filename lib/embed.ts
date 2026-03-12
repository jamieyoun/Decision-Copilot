// lib/embed.ts
// Local embeddings using Transformers.js (@xenova/transformers)
//
// Runs server-side only (API routes / server components).
// Provides: embedTexts(texts) -> normalized embeddings for cosine similarity.
import { pipeline, env } from '@xenova/transformers';

// Optional: keep model files local (cached). Default is fine.
// You can uncomment if you want to ensure caching behavior.
// env.cacheDir = '.cache/transformers';

// If your environment ever blocks remote model downloads, you can also set:
// env.allowRemoteModels = true;  // default true
// env.allowLocalModels = true;   // default true

const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';

// A lazy singleton so we only load the model once per server process.
let embedderPromise: Promise<any> | null = null;

async function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline('feature-extraction', MODEL_ID);
  }
  return embedderPromise;
}

/**
* L2-normalize a vector so cosine similarity becomes a dot product.
*/
export function normalize(vec: number[]): number[] {
  let sumSq = 0;
  for (const v of vec) sumSq += v * v;
  const norm = Math.sqrt(sumSq) || 1;
  return vec.map((v) => v / norm);
}

/**
* Mean-pool embeddings over the token dimension.
* Handles a few shapes depending on transformers.js output.
*/
function meanPool(output: any): number[] {
  // transformers.js commonly returns a Tensor-like object with .data and .dims,
  // or nested arrays. We'll handle both.
  if (output?.dims && output?.data) {
    const dims: number[] = output.dims; // typically [1, tokens, hidden]
    const data: Float32Array | number[] = output.data;

    if (dims.length !== 3) {
      throw new Error(`Unexpected embedding dims: ${JSON.stringify(dims)}`);
    }

    const tokens = dims[1];
    const hidden = dims[2];

    const pooled = new Array(hidden).fill(0);
    // data is flattened [batch, tokens, hidden] => [tokens*hidden] for batch=1
    for (let t = 0; t < tokens; t++) {
      for (let h = 0; h < hidden; h++) {
        pooled[h] += (data as any)[t * hidden + h];
      }
    }
    for (let h = 0; h < hidden; h++) pooled[h] /= tokens;
    return pooled;
  }

  // Fallback: nested arrays [[[...]]]
  if (Array.isArray(output)) {
    // If shape is [1][tokens][hidden]
    const batch = output[0];
    if (!Array.isArray(batch)) throw new Error('Unexpected embedding output structure.');

    const tokens = batch.length;
    const hidden = batch[0]?.length;
    if (!hidden) throw new Error('Unexpected embedding output structure.');

    const pooled = new Array(hidden).fill(0);
    for (let t = 0; t < tokens; t++) {
      for (let h = 0; h < hidden; h++) pooled[h] += batch[t][h];
    }
    for (let h = 0; h < hidden; h++) pooled[h] /= tokens;
    return pooled;
  }

  throw new Error('Unknown embedding output format from transformer pipeline.');
}

/**
* Embed a list of texts into normalized vectors.
* - Uses mean pooling over token embeddings
* - L2 normalizes each vector
*/
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!texts || texts.length === 0) return [];

  const embedder = await getEmbedder();

  const vectors: number[][] = [];
  for (const text of texts) {
    const cleaned = (text || '').trim();
    if (!cleaned) {
      vectors.push([]);
      continue;
    }

    // For feature-extraction pipelines, we request raw token embeddings.
    // Some versions support `pooling` options; we do our own mean pooling.
    const out = await embedder(cleaned);
    const pooled = meanPool(out);
    vectors.push(normalize(pooled));
  }

  return vectors;
}