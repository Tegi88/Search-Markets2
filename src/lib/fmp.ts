import type {
  AnalystEstimate,
  AnalystSection,
  BalanceSheetStatement,
  CashFlowStatement,
  CompanyProfile,
  CompanyRating,
  CoreStockData,
  DividendHistoryItem,
  DividendsSection,
  FinancialGrowth,
  FinancialsSection,
  GrowthSection,
  HistoricalPrice,
  IncomeStatement,
  InsiderTrade,
  InstitutionalHolder,
  KeyMetrics,
  NewsItem,
  NewsSection,
  OwnershipSection,
  PriceTargetSummary,
  Quote,
  Ratio,
  SearchResult,
  SectionName,
  UpgradeDowngrade,
} from "./types";
import { getYahooQuote } from "./yahoo";
import { getEdgarBalanceSheet, getEdgarCashFlow, getEdgarIncomeStatement } from "./edgar";

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
    const message = `FMP request failed (${res.status}): ${url.split("apikey=")[0]}... ${detail}`;
    console.error(`[fmp] ${message}`);
    throw new Error(message);
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
    // Not present on FMP's stable /quote response for the free plan;
    // left undefined here and backfilled from other data where possible.
    avgVolume: pick(raw, "avgVolume", "averageVolume"),
    open: pick(raw, "open") ?? 0,
    previousClose: pick(raw, "previousClose") ?? 0,
    eps: pick(raw, "eps"),
    pe: pick(raw, "pe", "peRatio"),
    sharesOutstanding: pick(raw, "sharesOutstanding"),
    exchange: pick<string>(raw, "exchange", "exchangeShortName"),
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
  const results = await runLimited(
    symbols.map((s) => () => getQuote(s)),
    3
  );
  return results
    .filter((r): r is PromiseFulfilledResult<Quote | null> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((q): q is Quote => q !== null);
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
  const data = await get<unknown>(url("/institutional-ownership/extract", { symbol }));
  return asArray<InstitutionalHolder>(data);
}

export async function getInsiderTrades(symbol: string): Promise<InsiderTrade[]> {
  const data = await get<unknown>(url("/insider-trading/search", { symbol, page: 0 }));
  return asArray<InsiderTrade>(data);
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
  const data = await get<unknown>(url("/news/stock", { symbols: symbol, limit }), 120);
  return asArray<NewsItem>(data);
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

/** Runs async jobs with limited concurrency — FMP's free plan appears to
 * throttle bursts of simultaneous requests, so firing off 18 calls at once
 * (as a plain Promise.all) silently starves most of them. */
async function runLimited(
  jobs: (() => Promise<unknown>)[],
  concurrency = 3
): Promise<PromiseSettledResult<unknown>[]> {
  const results: PromiseSettledResult<unknown>[] = new Array(jobs.length);
  let next = 0;
  async function worker() {
    while (next < jobs.length) {
      const i = next++;
      try {
        results[i] = { status: "fulfilled", value: await jobs[i]() };
      } catch (reason) {
        results[i] = { status: "rejected", reason };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));
  return results;
}

function errMsg(result: PromiseSettledResult<unknown>): string | undefined {
  if (result.status !== "rejected") return undefined;
  return result.reason instanceof Error ? result.reason.message : String(result.reason);
}

/**
 * The data every stock page needs immediately: header + overview +
 * valuation. Kept small on purpose — FMP's free plan caps requests at
 * 250/day, and each additional section below is only fetched the first
 * time its tab is actually opened.
 */
export async function getCoreStockData(symbol: string): Promise<CoreStockData> {
  const sym = symbol.toUpperCase();

  const results = await runLimited(
    [
      () => getProfile(sym),
      () => getQuote(sym),
      () => getRatios(sym, "annual"),
      () => getKeyMetrics(sym, "annual"),
      () => getRating(sym),
      () => getPeers(sym),
    ],
    3
  );

  const value = <T>(i: number, fallback: T): T =>
    results[i].status === "fulfilled" ? ((results[i] as PromiseFulfilledResult<T>).value ?? fallback) : fallback;

  let quote = value<Quote | null>(1, null);
  const ratios = value<Ratio[]>(2, []);
  let profile = value<CompanyProfile | null>(0, null);

  // FMP's free plan is quota-limited (250 req/day) — if quote and/or
  // profile were throttled or errored, fall back to Yahoo's free,
  // unofficial endpoint rather than showing a blank/missing header.
  if (!quote || !quote.avgVolume || !profile) {
    const yq = await getYahooQuote(sym).catch(() => null);
    if (yq && yq.price) {
      if (!quote) {
        quote = {
          symbol: sym,
          name: yq.name ?? profile?.companyName ?? sym,
          price: yq.price,
          change: yq.previousClose ? yq.price - yq.previousClose : 0,
          changesPercentage: yq.previousClose ? ((yq.price - yq.previousClose) / yq.previousClose) * 100 : 0,
          dayLow: yq.dayLow ?? 0,
          dayHigh: yq.dayHigh ?? 0,
          yearLow: yq.yearLow ?? 0,
          yearHigh: yq.yearHigh ?? 0,
          marketCap: yq.marketCap ?? profile?.mktCap ?? 0,
          priceAvg50: 0,
          priceAvg200: 0,
          volume: yq.volume ?? 0,
          avgVolume: yq.avgVolume,
          open: yq.price,
          previousClose: yq.previousClose ?? 0,
          exchange: yq.exchange,
        };
      } else if (!quote.avgVolume) {
        quote.avgVolume = yq.avgVolume;
      }

      if (!profile) {
        // Bare-bones stand-in so the page can render while FMP's profile
        // endpoint is out of quota — no description/sector/logo available.
        profile = {
          symbol: sym,
          companyName: yq.name ?? sym,
          price: yq.price,
          changes: quote.change,
          changesPercentage: quote.changesPercentage,
          currency: yq.currency ?? "USD",
          exchangeShortName: yq.exchange ?? "",
          industry: "",
          sector: "",
          country: "",
          website: "",
          description: "",
          ceo: "",
          fullTimeEmployees: "",
          image: "",
          ipoDate: "",
          mktCap: yq.marketCap ?? 0,
          beta: 0,
          volAvg: yq.avgVolume ?? 0,
          range: yq.yearLow && yq.yearHigh ? `${yq.yearLow}-${yq.yearHigh}` : "",
        };
      }
    }
  }

  // The free-plan quote endpoint doesn't return trailing EPS/P·E — derive
  // a rough trailing P/E from the latest annual ratios if it's missing.
  if (quote && ratios[0] && !quote.eps && ratios[0].priceEarningsRatio) {
    quote.pe = ratios[0].priceEarningsRatio;
  }

  const debug: Record<string, string> = {};
  const labels = ["profile", "quote", "ratios", "keyMetrics", "rating", "peers"];
  results.forEach((r, i) => {
    const msg = errMsg(r);
    if (msg) debug[labels[i]] = msg;
  });

  return {
    symbol: sym,
    profile,
    quote,
    ratios,
    keyMetrics: value<KeyMetrics[]>(3, []),
    rating: value<CompanyRating | null>(4, null),
    peers: value<string[]>(5, []),
    debug: Object.keys(debug).length > 0 ? debug : undefined,
  };
}

export async function getFinancialsSection(symbol: string): Promise<FinancialsSection> {
  const sym = symbol.toUpperCase();

  // SEC EDGAR (official, free, unlimited) is the primary source for US
  // tickers — it shares one cached CIK lookup + company-facts fetch across
  // all three statements, so this costs zero FMP quota when it succeeds.
  const edgarResults = await runLimited(
    [() => getEdgarIncomeStatement(sym), () => getEdgarBalanceSheet(sym), () => getEdgarCashFlow(sym)],
    3
  );
  const edgarValue = <T>(i: number): T[] =>
    edgarResults[i].status === "fulfilled" ? ((edgarResults[i] as PromiseFulfilledResult<T[]>).value ?? []) : [];
  const edgarIncome = edgarValue<IncomeStatement>(0);
  const edgarBalance = edgarValue<BalanceSheetStatement>(1);
  const edgarCashflow = edgarValue<CashFlowStatement>(2);
  console.error(
    `[financials] ${sym} EDGAR rows — income:${edgarIncome.length} balance:${edgarBalance.length} cashflow:${edgarCashflow.length}`
  );

  const debug: Record<string, string> = {};
  const edgarLabels = ["edgarIncome", "edgarBalance", "edgarCashflow"];
  edgarResults.forEach((r, i) => {
    const msg = errMsg(r);
    if (msg) debug[edgarLabels[i]] = msg;
  });

  const needsFmp: { label: string; job: () => Promise<unknown> }[] = [];
  if (edgarIncome.length === 0) needsFmp.push({ label: "fmpIncome", job: () => getIncomeStatement(sym, "annual") });
  if (edgarBalance.length === 0) needsFmp.push({ label: "fmpBalance", job: () => getBalanceSheet(sym, "annual") });
  if (edgarCashflow.length === 0) needsFmp.push({ label: "fmpCashflow", job: () => getCashFlow(sym, "annual") });

  const fmpResults = needsFmp.length > 0 ? await runLimited(needsFmp.map((n) => n.job), 2) : [];
  fmpResults.forEach((r, i) => {
    const msg = errMsg(r);
    if (msg) debug[needsFmp[i].label] = msg;
  });

  let fmpIdx = 0;
  const nextFmp = <T>(fallback: T): T =>
    fmpResults[fmpIdx] && fmpResults[fmpIdx++].status === "fulfilled"
      ? ((fmpResults[fmpIdx - 1] as PromiseFulfilledResult<T>).value ?? fallback)
      : fallback;

  return {
    income: edgarIncome.length > 0 ? edgarIncome : nextFmp<IncomeStatement[]>([]),
    balance: edgarBalance.length > 0 ? edgarBalance : nextFmp<BalanceSheetStatement[]>([]),
    cashflow: edgarCashflow.length > 0 ? edgarCashflow : nextFmp<CashFlowStatement[]>([]),
    debug: Object.keys(debug).length > 0 ? debug : undefined,
  };
}

export async function getGrowthSection(symbol: string): Promise<GrowthSection> {
  return { growth: await getFinancialGrowth(symbol.toUpperCase(), "annual") };
}

export async function getDividendsSection(symbol: string): Promise<DividendsSection> {
  return { dividends: await getDividendHistory(symbol.toUpperCase()) };
}

export async function getOwnershipSection(symbol: string): Promise<OwnershipSection> {
  const sym = symbol.toUpperCase();
  const results = await runLimited(
    [() => getInstitutionalHolders(sym), () => getInsiderTrades(sym)],
    2
  );
  const value = <T>(i: number, fallback: T): T =>
    results[i].status === "fulfilled" ? ((results[i] as PromiseFulfilledResult<T>).value ?? fallback) : fallback;
  const debug: Record<string, string> = {};
  ["institutionalHolders", "insiderTrades"].forEach((label, i) => {
    const msg = errMsg(results[i]);
    if (msg) debug[label] = msg;
  });
  return {
    institutionalHolders: value<InstitutionalHolder[]>(0, []),
    insiderTrades: value<InsiderTrade[]>(1, []),
    debug: Object.keys(debug).length > 0 ? debug : undefined,
  };
}

export async function getAnalystSection(symbol: string): Promise<AnalystSection> {
  const sym = symbol.toUpperCase();
  const results = await runLimited(
    [() => getAnalystEstimates(sym), () => getPriceTargetSummary(sym), () => getUpgradesDowngrades(sym)],
    2
  );
  const value = <T>(i: number, fallback: T): T =>
    results[i].status === "fulfilled" ? ((results[i] as PromiseFulfilledResult<T>).value ?? fallback) : fallback;
  return {
    estimates: value<AnalystEstimate[]>(0, []),
    priceTarget: value<PriceTargetSummary | null>(1, null),
    upgradesDowngrades: value<UpgradeDowngrade[]>(2, []),
  };
}

export async function getNewsSection(symbol: string): Promise<NewsSection> {
  return { news: await getNews(symbol.toUpperCase()) };
}

export async function getSectionData(symbol: string, section: SectionName) {
  switch (section) {
    case "financials":
      return getFinancialsSection(symbol);
    case "growth":
      return getGrowthSection(symbol);
    case "dividends":
      return getDividendsSection(symbol);
    case "ownership":
      return getOwnershipSection(symbol);
    case "analyst":
      return getAnalystSection(symbol);
    case "news":
      return getNewsSection(symbol);
  }
}
