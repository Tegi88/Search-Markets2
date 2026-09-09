import type { HistoricalPrice } from "./types";

// Stooq's free CSV endpoint — no key, no meaningful rate limit. Used as a
// fallback for historical prices when Yahoo's unofficial endpoint is
// unavailable. US tickers use the ".us" suffix; this is a best-effort
// default and won't resolve every foreign listing.
const BASE = "https://stooq.com/q/d/l/";

function toStooqDate(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

export async function getStooqHistoricalPrices(
  symbol: string,
  opts: { from?: string; to?: string } = {}
): Promise<HistoricalPrice[]> {
  const ticker = `${symbol.toLowerCase()}.us`;
  const params = new URLSearchParams({ s: ticker, i: "d" });
  if (opts.from) params.set("d1", opts.from.replace(/-/g, ""));
  if (opts.to) params.set("d2", toStooqDate(new Date(opts.to)));

  const url = `${BASE}?${params.toString()}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Stooq request failed: ${res.status} ${res.statusText} (${url})`);
  const text = await res.text();
  if (!text || text.startsWith("<") || /no data/i.test(text)) {
    throw new Error(`Stooq returned no data for ${ticker} (${url})`);
  }

  const lines = text.trim().split("\n");
  const prices: HistoricalPrice[] = [];
  for (let i = 1; i < lines.length; i++) {
    const [date, open, high, low, close, volume] = lines[i].split(",");
    if (!date || Number.isNaN(Date.parse(date))) continue;
    prices.push({
      date,
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
      adjClose: Number(close),
      volume: Number(volume) || 0,
    });
  }
  if (prices.length === 0) throw new Error(`Stooq CSV for ${ticker} had no parseable rows (${url})`);
  return prices;
}
