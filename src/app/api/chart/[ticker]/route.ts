import { NextRequest, NextResponse } from "next/server";
import { getHistoricalPrices } from "@/lib/fmp";
import { getYahooHistoricalPrices } from "@/lib/yahoo";
import { getStooqHistoricalPrices } from "@/lib/stooq";

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

  // Yahoo and Stooq are free with no meaningful daily cap, so they carry
  // the price chart; FMP (quota-limited) is only a last resort.
  const debug: Record<string, string> = {};
  let prices: Awaited<ReturnType<typeof getYahooHistoricalPrices>> = [];
  let source = "yahoo";

  try {
    prices = await getYahooHistoricalPrices(ticker, range);
  } catch (err) {
    debug.yahoo = err instanceof Error ? err.message : String(err);
  }

  if (prices.length === 0) {
    source = "stooq";
    try {
      prices = await getStooqHistoricalPrices(ticker, from ? { from } : {});
    } catch (err) {
      debug.stooq = err instanceof Error ? err.message : String(err);
    }
  }

  if (prices.length === 0) {
    source = "fmp";
    try {
      prices = await getHistoricalPrices(ticker, from ? { from } : {});
    } catch (err) {
      debug.fmp = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({ prices, source, debug: Object.keys(debug).length ? debug : undefined });
}
