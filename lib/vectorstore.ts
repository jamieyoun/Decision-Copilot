// lib/vectorstore.ts
//
// Tiny local vector store for a portfolio-friendly RAG setup.
// - Stores embeddings + metadata as JSON on disk (index/vectors.json)
// - Loads index back into memory
// - Searches via cosine similarity (dot product) assuming embeddings are L2-normalized
import fs from "fs/promises";
import path from "path";

export type VectorItem<TMetadata = any> = {
  embedding: number[]; // assumed L2-normalized
  metadata: TMetadata;
};

export type SearchResult<TMetadata = any> = {
  score: number;
  metadata: TMetadata;
};

function defaultIndexPath() {
  return path.join(process.cwd(), "index", "vectors.json");
}

async function pathExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/**
* Ensure the directory for the index file exists (e.g., ./index).
*/
export async function ensureIndexDir(filePath: string = defaultIndexPath()) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

/**
* Save the vector index to disk as JSON.
* Writes atomically (write temp -> rename) to avoid partial files.
*/
export async function saveIndex<TMetadata = any>(
  items: VectorItem<TMetadata>[],
  filePath: string = defaultIndexPath()
) {
  await ensureIndexDir(filePath);

  const tmpPath = `${filePath}.tmp`;
  const json = JSON.stringify(items);

  await fs.writeFile(tmpPath, json, "utf-8");
  await fs.rename(tmpPath, filePath);
}

/**
* Load the vector index from disk.
* Throws a helpful error if the file doesn't exist.
*/
export async function loadIndex<TMetadata = any>(
  filePath: string = defaultIndexPath()
): Promise<VectorItem<TMetadata>[]> {
  const exists = await pathExists(filePath);
  if (!exists) {
    throw new Error(
      `Vector index not found at ${filePath}. Run POST /api/ingest to build it.`
    );
  }

  const raw = await fs.readFile(filePath, "utf-8");
  const items = JSON.parse(raw);

  if (!Array.isArray(items)) {
    throw new Error(`Invalid index format at ${filePath}: expected an array.`);
  }

  return items as VectorItem<TMetadata>[];
}

/**
* Dot product between two vectors.
* If embeddings are normalized, dot(vecA, vecB) == cosine similarity.
*/
export function dot(a: number[], b: number[]) {
  const len = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < len; i++) sum += a[i] * b[i];
  return sum;
}

/**
* Search the in-memory items by similarity to queryEmbedding.
* Assumes queryEmbedding and item embeddings are L2-normalized.
*/
export function searchIndex<TMetadata = any>(
  queryEmbedding: number[],
  items: VectorItem<TMetadata>[],
  topK: number = 10,
  minScore: number = -1 // optional threshold; cosine ranges [-1, 1]
): SearchResult<TMetadata>[] {
  if (!queryEmbedding?.length) return [];

  const scored: SearchResult<TMetadata>[] = [];

  for (const item of items) {
    const emb = item.embedding;
    if (!emb?.length) continue;

    const score = dot(queryEmbedding, emb);
    if (score >= minScore) {
      scored.push({ score, metadata: item.metadata });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/**
* Convenience: load index and search in one call.
*/
export async function loadAndSearch<TMetadata = any>(
  queryEmbedding: number[],
  topK: number = 10,
  filePath: string = defaultIndexPath()
): Promise<SearchResult<TMetadata>[]> {
  const items = await loadIndex<TMetadata>(filePath);
  return searchIndex(queryEmbedding, items, topK);
}