import { NextResponse } from "next/server";
import { loadMeetingDocs } from "@/lib/loader";
import { chunkMeeting } from "@/lib/chunker";
import { embedTexts } from "@/lib/embed";
import { saveIndex } from "@/lib/vectorstore";

export async function POST() {
  const start = Date.now();
  try {
    const docs = await loadMeetingDocs();
    const chunks = docs.flatMap((d) => chunkMeeting(d));

    if (docs.length === 0) {
      return NextResponse.json(
        { error: { message: "No meeting docs found in data/meetings." } },
        { status: 400 }
      );
    }

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: { message: "No chunks produced. Check your chunker and section headings." } },
        { status: 400 }
      );
    }

    const texts = chunks.map((c) => c.text);
    const embeddings = await embedTexts(texts);

    if (embeddings.length !== chunks.length) {
      return NextResponse.json(
        {
          error: {
            message: `Embedding count mismatch: embeddings=${embeddings.length}, chunks=${chunks.length}`,
          },
        },
        { status: 500 }
      );
    }

    const items = chunks.map((chunk, i) => ({
      embedding: embeddings[i],
      metadata: chunk,
    }));

    await saveIndex(items); // writes index/vectors.json by default

    // Count chunks by section
    const chunkCountsBySection = chunks.reduce((acc, c) => {
      acc[c.section] = (acc[c.section] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalDocuments: docs.length,
      totalChunks: chunks.length,
      chunkCountsBySection,
      indexPath: "index/vectors.json",
      ms: Date.now() - start,
    });
  } catch (err: any) {
    console.error("INGEST_ERROR:", err);
    return NextResponse.json(
      { error: { message: err?.message ?? String(err), stack: err?.stack ?? null } },
      { status: 500 }
    );
  }
}