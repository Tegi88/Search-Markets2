import type {
  AnalystEstimate,
  BalanceSheetStatement,
  CashFlowStatement,
  CompanyProfile,
  CompanyRating,
  DividendHistoryItem,
  FinancialGrowth,
  FullStockData,
  HistoricalPrice,
  IncomeStatement,
  InsiderTrade,
  InstitutionalHolder,
  KeyMetrics,
  NewsItem,
  PriceTargetSummary,
  Quote,
  Ratio,
  SearchResult,
  UpgradeDowngrade,
} from "./types";

// FMP retired the legacy /api/v3 and /api/v4 endpoints on 2025-08-31.
// Every request now goes through the "stable" API, which uses query
// parameters (?symbol=AAPL) instead of path segments (/AAPL) and
// returns flat arrays rather than wrapped objects.
const BASE = "https://financialmodelingprep.com/stable";

function apiKey(): string {
  const key = process.env.FMP_API_KEY;
  if (!key) {
    throw new Error(
      "MISSING_API_KEY: Set FMP_API_KEY in your .env.local file. Get a free key at https://site.financialmodelingprep.com/developer/docs/pricing"
    );
  }
  return key;
}

async function get<T>(url: string, revalidateSeconds = 300): Promise<T> {
  const res = await fetch(url, { next: { revalidate: revalidateSeconds } });
  if (!res.ok) {
    let detail = "";
    try {
      detail = JSON.stringify(await res.json());
    } catch {
      // ignore
    }
    throw new Error(`FMP request failed (${res.status}): ${url.split("apikey=")[0]}... ${detail}`);
  }
  return res.json() as Promise<T>;
}

function url(path: string, params: Record<string, string | number | undefined> = {}) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) usp.set(k, String(v));
  }
  usp.set("apikey", apiKey());
  return `${BASE}${path}?${usp.toString()}`;
}

/** Reads the first defined value among several possible field names — a
 * defensive shim against FMP renaming fields between API versions. */
function pick<T = number>(obj: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k] as T;
  }
  return undefined;
}

function normalizeQuote(raw: Record<string, unknown>): Quote {
  return {
    symbol: pick<string>(raw, "symbol") ?? "",
    name: pick<string>(raw, "name") ?? "",
    price: pick(raw, "price") ?? 0,
    changesPercentage: pick(raw, "changePercentage", "changesPercentage") ?? 0,
    change: pick(raw, "change") ?? 0,
    dayLow: pick(raw, "dayLow") ?? 0,
    dayHigh: pick(raw, "dayHigh") ?? 0,
    yearHigh: pick(raw, "yearHigh") ?? 0,
    yearLow: pick(raw, "yearLow") ?? 0,
    marketCap: pick(raw, "marketCap") ?? 0,
    priceAvg50: pick(raw, "priceAvg50") ?? 0,
    priceAvg200: pick(raw, "priceAvg200") ?? 0,
    volume: pick(raw, "volume") ?? 0,
    avgVolume: pick(raw, "avgVolume", "averageVolume") ?? 0,
    open: pick(raw, "open") ?? 0,
    previousClose: pick(raw, "previousClose") ?? 0,
    eps: pick(raw, "eps") ?? 0,
    pe: pick(raw, "pe") ?? 0,
    sharesOutstanding: pick(raw, "sharesOutstanding") ?? 0,
    timestamp: pick(raw, "timestamp"),
  };
}

function normalizeProfile(raw: Record<string, unknown>): CompanyProfile {
  return {
    symbol: pick<string>(raw, "symbol") ?? "",
    companyName: pick<string>(raw, "companyName") ?? "",
    price: pick(raw, "price") ?? 0,
    changes: pick(raw, "change", "changes") ?? 0,
    changesPercentage: pick(raw, "changePercentage", "changesPercentage"),
    currency: pick<string>(raw, "currency") ?? "USD",
    cik: pick<string>(raw, "cik"),
    isin: pick<string>(raw, "isin"),
    exchangeShortName: pick<string>(raw, "exchangeShortName", "exchange") ?? "",
    industry: pick<string>(raw, "industry") ?? "",
    sector: pick<string>(raw, "sector") ?? "",
    country: pick<string>(raw, "country") ?? "",
    website: pick<string>(raw, "website") ?? "",
    description: pick<string>(raw, "description") ?? "",
    ceo: pick<string>(raw, "ceo") ?? "",
    fullTimeEmployees: pick<string>(raw, "fullTimeEmployees") ?? "",
    image: pick<string>(raw, "image") ?? "",
    ipoDate: pick<string>(raw, "ipoDate") ?? "",
    mktCap: pick(raw, "marketCap", "mktCap") ?? 0,
    beta: pick(raw, "beta") ?? 0,
    volAvg: pick(raw, "averageVolume", "volAvg") ?? 0,
    range: pick<string>(raw, "range") ?? "",
    dcf: pick(raw, "dcf"),
    dcfDiff: pick(raw, "dcfDiff"),
    isEtf: pick<boolean>(raw, "isEtf"),
    isFund: pick<boolean>(raw, "isFund"),
  };
}

function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { historical?: unknown }).historical)) {
    return (data as { historical: T[] }).historical;
  }
  return [];
}

export async function searchSymbols(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const data = await get<SearchResult[]>(url("/search-symbol", { query, limit: 12 }), 60);
  return asArray<SearchResult>(data);
}

export async function getProfile(symbol: string): Promise<CompanyProfile | null> {
  const data = await get<Record<string, unknown>[]>(url("/profile", { symbol }));
  const raw = asArray<Record<string, unknown>>(data)[0];
  return raw ? normalizeProfile(raw) : null;
}

export async function getQuote(symbol: string): Promise<Quote | null> {
  const data = await get<Record<string, unknown>[]>(url("/quote", { symbol }), 60);
  const raw = asArray<Record<string, unknown>>(data)[0];
  return raw ? normalizeQuote(raw) : null;
}

export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  if (symbols.length === 0) return [];
  const results = await Promise.all(symbols.map((s) => getQuote(s).catch(() => null)));
  return results.filter((q): q is Quote => q !== null);
}

export async function getHistoricalPrices(
  symbol: string,
  opts: { from?: string; to?: string } = {}
): Promise<HistoricalPrice[]> {
  const data = await get<unknown>(url("/historical-price-eod/full", { symbol, ...opts }));
  const historical = asArray<HistoricalPrice>(data);
  return [...historical].reverse();
}

export async function getIncomeStatement(
  symbol: string,
  period: "annual" | "quarter" = "annual",
  limit = 10
): Promise<IncomeStatement[]> {
  const data = await get<unknown>(url("/income-statement", { symbol, period, limit }));
  return asArray<IncomeStatement>(data);
}

export async function getBalanceSheet(
  symbol: string,
  period: "annual" | "quarter" = "annual",
  limit = 10
): Promise<BalanceSheetStatement[]> {
  const data = await get<unknown>(url("/balance-sheet-statement", { symbol, period, limit }));
  return asArray<BalanceSheetStatement>(data);
}

export async function getCashFlow(
  symbol: string,
  period: "annual" | "quarter" = "annual",
  limit = 10
): Promise<CashFlowStatement[]> {
  const data = await get<unknown>(url("/cash-flow-statement", { symbol, period, limit }));
  return asArray<CashFlowStatement>(data);
}

export async function getRatios(
  symbol: string,
  period: "annual" | "quarter" = "annual",
  limit = 10
): Promise<Ratio[]> {
  const data = await get<unknown>(url("/ratios", { symbol, period, limit }));
  return asArray<Ratio>(data);
}

export async function getKeyMetrics(
  symbol: string,
  period: "annual" | "quarter" = "annual",
  limit = 10
): Promise<KeyMetrics[]> {
  const data = await get<unknown>(url("/key-metrics", { symbol, period, limit }));
  return asArray<KeyMetrics>(data);
}

export async function getFinancialGrowth(
  symbol: string,
  period: "annual" | "quarter" = "annual",
  limit = 10
): Promise<FinancialGrowth[]> {
  const data = await get<unknown>(url("/financial-growth", { symbol, period, limit }));
  return asArray<FinancialGrowth>(data);
}

export async function getAnalystEstimates(symbol: string): Promise<AnalystEstimate[]> {
  try {
    const data = await get<unknown>(url("/analyst-estimates", { symbol, period: "annual", limit: 8 }));
    return asArray<AnalystEstimate>(data);
  } catch {
    return [];
  }
}

export async function getPriceTargetSummary(symbol: string): Promise<PriceTargetSummary | null> {
  try {
    const data = await get<unknown>(url("/price-target-summary", { symbol }));
    const arr = asArray<PriceTargetSummary>(data);
    if (arr.length > 0) return arr[0];
    return (data as PriceTargetSummary) ?? null;
  } catch {
    return null;
  }
}

export async function getUpgradesDowngrades(symbol: string): Promise<UpgradeDowngrade[]> {
  try {
    const data = await get<unknown>(url("/grades", { symbol }));
    return asArray<UpgradeDowngrade>(data);
  } catch {
    return [];
  }
}

export async function getInstitutionalHolders(symbol: string): Promise<InstitutionalHolder[]> {
  try {
    const data = await get<unknown>(url("/institutional-ownership/extract", { symbol }));
    return asArray<InstitutionalHolder>(data);
  } catch {
    return [];
  }
}

export async function getInsiderTrades(symbol: string): Promise<InsiderTrade[]> {
  try {
    const data = await get<unknown>(url("/insider-trading/search", { symbol, page: 0 }));
    return asArray<InsiderTrade>(data);
  } catch {
    return [];
  }
}

export async function getDividendHistory(symbol: string): Promise<DividendHistoryItem[]> {
  try {
    const data = await get<unknown>(url("/dividends", { symbol }));
    return asArray<DividendHistoryItem>(data);
  } catch {
    return [];
  }
}

export async function getRating(symbol: string): Promise<CompanyRating | null> {
  try {
    const data = await get<Record<string, unknown>[]>(url("/ratings-snapshot", { symbol }));
    const raw = asArray<Record<string, unknown>>(data)[0];
    if (!raw) return null;
    return {
      symbol: pick<string>(raw, "symbol") ?? symbol,
      date: pick<string>(raw, "date") ?? "",
      rating: pick<string>(raw, "rating") ?? "",
      ratingScore: pick(raw, "ratingScore", "overallScore") ?? 0,
      ratingRecommendation: pick<string>(raw, "ratingRecommendation", "ratingDetailsDCFRecommendation") ?? "",
    };
  } catch {
    return null;
  }
}

export async function getNews(symbol: string, limit = 12): Promise<NewsItem[]> {
  try {
    const data = await get<unknown>(url("/news/stock", { symbols: symbol, limit }), 120);
    return asArray<NewsItem>(data);
  } catch {
    return [];
  }
}

export async function getPeers(symbol: string): Promise<string[]> {
  try {
    const data = await get<Record<string, unknown>[]>(url("/stock-peers", { symbol }));
    const arr = asArray<Record<string, unknown>>(data);
    const first = arr[0];
    if (first && Array.isArray(first.peersList)) return first.peersList as string[];
    return arr.map((r) => pick<string>(r, "peerSymbol", "symbol")).filter((s): s is string => !!s && s !== symbol);
  } catch {
    return [];
  }
}

export async function getFullStockData(symbol: string): Promise<FullStockData> {
  const sym = symbol.toUpperCase();

  const results = await Promise.allSettled([
    getProfile(sym),
    getQuote(sym),
    getIncomeStatement(sym, "annual"),
    getIncomeStatement(sym, "quarter", 8),
    getBalanceSheet(sym, "annual"),
    getCashFlow(sym, "annual"),
    getRatios(sym, "annual"),
    getKeyMetrics(sym, "annual"),
    getFinancialGrowth(sym, "annual"),
    getAnalystEstimates(sym),
    getPriceTargetSummary(sym),
    getUpgradesDowngrades(sym),
    getInstitutionalHolders(sym),
    getInsiderTrades(sym),
    getDividendHistory(sym),
    getRating(sym),
    getNews(sym),
    getPeers(sym),
  ]);

  const value = <T>(i: number, fallback: T): T =>
    results[i].status === "fulfilled" ? ((results[i] as PromiseFulfilledResult<T>).value ?? fallback) : fallback;

  return {
    symbol: sym,
    profile: value<CompanyProfile | null>(0, null),
    quote: value<Quote | null>(1, null),
    income: value<IncomeStatement[]>(2, []),
    incomeQuarterly: value<IncomeStatement[]>(3, []),
    balance: value<BalanceSheetStatement[]>(4, []),
    cashflow: value<CashFlowStatement[]>(5, []),
    ratios: value<Ratio[]>(6, []),
    keyMetrics: value<KeyMetrics[]>(7, []),
    growth: value<FinancialGrowth[]>(8, []),
    estimates: value<AnalystEstimate[]>(9, []),
    priceTarget: value<PriceTargetSummary | null>(10, null),
    upgradesDowngrades: value<UpgradeDowngrade[]>(11, []),
    institutionalHolders: value<InstitutionalHolder[]>(12, []),
    insiderTrades: value<InsiderTrade[]>(13, []),
    dividends: value<DividendHistoryItem[]>(14, []),
    rating: value<CompanyRating | null>(15, null),
    news: value<NewsItem[]>(16, []),
    peers: value<string[]>(17, []),
  };
}
