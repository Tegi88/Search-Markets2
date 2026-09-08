import { NextRequest, NextResponse } from "next/server";
import { getSectionData } from "@/lib/fmp";
import type { SectionName } from "@/lib/types";

const VALID_SECTIONS: SectionName[] = ["financials", "growth", "dividends", "ownership", "analyst", "news"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticker: string; section: string }> }
) {
  const { ticker, section } = await params;
  if (!VALID_SECTIONS.includes(section as SectionName)) {
    return NextResponse.json({ error: `Unknown section "${section}"` }, { status: 400 });
  }
  try {
    const data = await getSectionData(ticker, section as SectionName);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isKeyError = message.startsWith("MISSING_API_KEY");
    return NextResponse.json({ error: message }, { status: isKeyError ? 500 : 502 });
  }
}
