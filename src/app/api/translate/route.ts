import { NextRequest, NextResponse } from "next/server";

// Google Translate's unofficial public endpoint (used by the "gtx" client,
// the same one browser extensions rely on). No key, no documented quota,
// no SLA — used only for the optional "translate to Hebrew" convenience on
// company descriptions, never for anything the app depends on.
const BASE = "https://translate.googleapis.com/translate_a/single";

export async function POST(req: NextRequest) {
  const { text, target = "he" } = (await req.json()) as { text?: string; target?: string };
  if (!text || !text.trim()) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const params = new URLSearchParams({
    client: "gtx",
    sl: "auto",
    tl: target,
    dt: "t",
    q: text,
  });
  const url = `${BASE}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SearchMarkets/1.0)" },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Google Translate failed: ${res.status} ${res.statusText}` },
        { status: 502 }
      );
    }
    const json = await res.json();
    // Response shape: [[[translatedChunk, originalChunk, ...], ...], ...]
    const chunks = (json?.[0] as [string, string][] | undefined) ?? [];
    const translated = chunks.map((c) => c[0]).join("");
    if (!translated) {
      return NextResponse.json({ error: "Google Translate returned no text" }, { status: 502 });
    }
    return NextResponse.json({ translated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }
}
