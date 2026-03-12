// app/api/analyze/route.ts
//
// POST { mode: "decisions" | "risks" | "actions", topK?: number }
// Returns extracted results + evidence from retrieved meeting chunks.
import { NextResponse } from "next/server";
import { embedTexts } from "@/lib/embed";
import { loadIndex, searchIndex } from "@/lib/vectorstore";
import { analyzeRetrieved, type Retrieved } from "@/lib/analyze";

export const runtime = "nodejs";

type Mode = "decisions" | "risks" | "actions";

function modeToQuery(mode: Mode): string {
  switch (mode) {
    case "decisions":
      return "open decisions unresolved decisions tbd open questions";
    case "risks":
      return "risks concerns blockers failure modes issues mitigation";
    case "actions":
      return "action items next steps todo tasks follow ups owners";
    default:
      return "meeting notes";
  }
}

function isValidMode(x: any): x is Mode {
  return x === "decisions" || x === "risks" || x === "actions";
}

export async function POST(req: Request) {
  const start = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const mode = body?.mode;

    if (!isValidMode(mode)) {
      return NextResponse.json(
        {
          error: {
            message: `Invalid mode. Expected one of: decisions | risks | actions`,
            hint: `Send POST body like {"mode":"decisions"}`,
          },
        },
        { status: 400 }
      );
    }

    const topK =
      typeof body?.topK === "number" && body.topK > 0
        ? Math.min(body.topK, 50)
        : 12;

    // 1) Embed mode query (local embeddings)
    const query = modeToQuery(mode);
    const [queryEmbedding] = await embedTexts([query]);

    if (!queryEmbedding || queryEmbedding.length === 0) {
      return NextResponse.json(
        { error: { message: "Failed to embed query. Embedding vector is empty." } },
        { status: 500 }
      );
    }

    // 2) Load local index
    const items = await loadIndex(); // defaults to index/vectors.json in vectorstore.ts

    // 3) Retrieve topK relevant chunks (score + metadata)
    const retrieved = searchIndex(queryEmbedding, items, topK);

    // Cast to match analyze.ts input type (score + MeetingChunk metadata)
    const retrievedForAnalyze: Retrieved[] = retrieved.map((r) => ({
      score: r.score,
      metadata: r.metadata,
    }));

    // 4) Rules-first extraction
    const extracted = analyzeRetrieved(retrievedForAnalyze);

    // 5) Mode-specific results
    const results =
      mode === "decisions"
        ? extracted.openDecisions
        : mode === "risks"
        ? extracted.risks
        : extracted.actionItems;

    // Evidence: return top retrieved chunks with short previews
    const evidence = retrievedForAnalyze.map((r) => ({
      score: r.score,
      citation: {
        meetingTitle: r.metadata.meetingTitle,
        meetingDate: r.metadata.meetingDate,
        meetingType: r.metadata.meetingType,
        section: r.metadata.section,
        sourceFile: r.metadata.sourceFile,
        chunkId: r.metadata.chunkId,
      },
      preview: (r.metadata.text || "").slice(0, 300),
    }));

    return NextResponse.json({
      mode,
      query,
      topK,
      resultCount: results.length,
      results,
      evidence,
      ms: Date.now() - start,
    });
  } catch (err: any) {
    console.error("ANALYZE_ERROR:", err);
    return NextResponse.json(
      { error: { message: err?.message ?? String(err), stack: err?.stack ?? null } },
      { status: 500 }
    );
  }
}