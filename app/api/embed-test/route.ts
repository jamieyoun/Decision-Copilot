import { NextResponse } from 'next/server';
import { embedTexts } from '@/lib/embed';
export async function GET() {
  const vectors = await embedTexts([
    'Hello world',
    'Open decisions and risks from meeting notes',
  ]);

  return NextResponse.json({
    dims: vectors[0]?.length ?? 0,
    sample: vectors[0]?.slice(0, 5) ?? [],
  });
}