import { NextRequest, NextResponse } from "next/server";
import { getHistoricalPrices } from "@/lib/fmp";

function fromDateForRange(range: string): string | undefined {
  const now = new Date();
  const d = new Date(now);
  switch (range) {
    case "1M":
      d.setMonth(d.getMonth() - 1);
      break;
    case "6M":
      d.setMonth(d.getMonth() - 6);
      break;
    case "1Y":
      d.setFullYear(d.getFullYear() - 1);
      break;
    case "5Y":
      d.setFullYear(d.getFullYear() - 5);
      break;
    case "MAX":
      return undefined;
    default:
      d.setFullYear(d.getFullYear() - 1);
  }
  return d.toISOString().slice(0, 10);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const range = req.nextUrl.searchParams.get("range") ?? "1Y";
  const from = fromDateForRange(range);
  try {
    const prices = await getHistoricalPrices(ticker, from ? { from } : {});
    return NextResponse.json({ prices });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ prices: [], error: message }, { status: 502 });
  }
}
