import { NextRequest, NextResponse } from "next/server";
import { searchSymbols } from "@/lib/fmp";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  try {
    const results = await searchSymbols(q);
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ results: [], error: message }, { status: 200 });
  }
}
