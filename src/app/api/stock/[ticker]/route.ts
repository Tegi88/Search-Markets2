import { NextRequest, NextResponse } from "next/server";
import { getCoreStockData } from "@/lib/fmp";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  try {
    const data = await getCoreStockData(ticker);
    if (!data.profile && !data.quote) {
      return NextResponse.json(
        { error: `No data found for "${ticker}". Check the ticker symbol.` },
        { status: 404 }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isKeyError = message.startsWith("MISSING_API_KEY");
    return NextResponse.json({ error: message }, { status: isKeyError ? 500 : 502 });
  }
}
