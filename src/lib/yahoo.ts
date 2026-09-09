import type { HistoricalPrice } from "./types";

// Yahoo's unofficial chart endpoint. No API key, no documented daily quota,
// but no SLA either — Yahoo can change or block this at any time. Used as
// a free fallback/primary alongside FMP and Stooq, never as the only source.
const CHART_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

interface YahooChartMeta {
  currency?: string;
  symbol?: string;
  exchangeName?: string;
  longName?: string;
  shortName?: string;
  regularMarketPrice?: number;
  previousClose?: number;
  chartPreviousClose?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
  averageDailyVolume10Day?: number;
  averageDailyVolume3Month?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  marketCap?: number;
}

interface YahooChartResult {
  meta: YahooChartMeta;
  timestamp?: number[];
  indicators: {
    quote: { open?: number[]; high?: number[]; low?: number[]; close?: number[]; volume?: number[] }[];
    adjclose?: { adjclose?: number[] }[];
  };
}

async function fetchChart(symbol: string, params: Record<string, string>): Promise<YahooChartResult> {
  const usp = new URLSearchParams(params);
  const url = `${CHART_BASE}/${encodeURIComponent(symbol)}?${usp.toString()}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SearchMarkets/1.0)" },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Yahoo chart failed: ${res.status} ${res.statusText} (${url})`);
  const json = await res.json();
  const result = json?.chart?.result?.[0] as YahooChartResult | undefined;
  if (!result) {
    const err = json?.chart?.error;
    throw new Error(`Yahoo chart returned no result${err ? `: ${JSON.stringify(err)}` : ""} (${url})`);
  }
  return result;
}

const RANGE_TO_YAHOO: Record<string, { range: string; interval: string }> = {
  "1M": { range: "1mo", interval: "1d" },
  "6M": { range: "6mo", interval: "1d" },
  "1Y": { range: "1y", interval: "1d" },
  "5Y": { range: "5y", interval: "1wk" },
  MAX: { range: "max", interval: "1mo" },
};

export async function getYahooHistoricalPrices(
  symbol: string,
  uiRange = "1Y"
): Promise<HistoricalPrice[]> {
  const { range, interval } = RANGE_TO_YAHOO[uiRange] ?? RANGE_TO_YAHOO["1Y"];
  const result = await fetchChart(symbol, { range, interval });
  if (!result.timestamp || !result.indicators?.quote?.[0]) {
    throw new Error(`Yahoo chart for ${symbol} had no timestamp/quote series`);
  }

  const q = result.indicators.quote[0];
  const adj = result.indicators.adjclose?.[0]?.adjclose;
  const prices: HistoricalPrice[] = [];
  for (let i = 0; i < result.timestamp.length; i++) {
    const close = q.close?.[i];
    if (close === null || close === undefined) continue;
    prices.push({
      date: new Date(result.timestamp[i] * 1000).toISOString().slice(0, 10),
      open: q.open?.[i] ?? close,
      high: q.high?.[i] ?? close,
      low: q.low?.[i] ?? close,
      close,
      adjClose: adj?.[i] ?? close,
      volume: q.volume?.[i] ?? 0,
    });
  }

  return prices;
}

export interface YahooQuoteLike {
  price?: number;
  previousClose?: number;
  dayLow?: number;
  dayHigh?: number;
  yearLow?: number;
  yearHigh?: number;
  volume?: number;
  avgVolume?: number;
  marketCap?: number;
  currency?: string;
  exchange?: string;
  name?: string;
}

export async function getYahooQuote(symbol: string): Promise<YahooQuoteLike | null> {
  const result = await fetchChart(symbol, { range: "1d", interval: "1d" });
  const meta = result.meta;
  if (!meta) return null;
  return {
    price: meta.regularMarketPrice,
    previousClose: meta.previousClose ?? meta.chartPreviousClose,
    dayLow: meta.regularMarketDayLow,
    dayHigh: meta.regularMarketDayHigh,
    yearLow: meta.fiftyTwoWeekLow,
    yearHigh: meta.fiftyTwoWeekHigh,
    volume: meta.regularMarketVolume,
    avgVolume: meta.averageDailyVolume10Day ?? meta.averageDailyVolume3Month,
    marketCap: meta.marketCap,
    currency: meta.currency,
    exchange: meta.exchangeName,
    name: meta.longName ?? meta.shortName,
  };
}
