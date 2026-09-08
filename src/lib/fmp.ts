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

const BASE_V3 = "https://financialmodelingprep.com/api/v3";
const BASE_V4 = "https://financialmodelingprep.com/api/v4";

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

function url(base: string, path: string, params: Record<string, string | number | undefined> = {}) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) usp.set(k, String(v));
  }
  usp.set("apikey", apiKey());
  return `${base}${path}?${usp.toString()}`;
}

export async function searchSymbols(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const data = await get<SearchResult[]>(
    url(BASE_V3, "/search", { query, limit: 12 }),
    60
  );
  return Array.isArray(data) ? data : [];
}

export async function getProfile(symbol: string): Promise<CompanyProfile | null> {
  const data = await get<CompanyProfile[]>(url(BASE_V3, `/profile/${symbol}`));
  return data?.[0] ?? null;
}

export async function getQuote(symbol: string): Promise<Quote | null> {
  const data = await get<Quote[]>(url(BASE_V3, `/quote/${symbol}`), 60);
  return data?.[0] ?? null;
}

export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  if (symbols.length === 0) return [];
  const data = await get<Quote[]>(url(BASE_V3, `/quote/${symbols.join(",")}`), 60);
  return Array.isArray(data) ? data : [];
}

export async function getHistoricalPrices(
  symbol: string,
  opts: { from?: string; to?: string } = {}
): Promise<HistoricalPrice[]> {
  const data = await get<{ historical: HistoricalPrice[] }>(
    url(BASE_V3, `/historical-price-full/${symbol}`, opts)
  );
  const historical = data?.historical ?? [];
  return [...historical].reverse();
}

export async function getIncomeStatement(
  symbol: string,
  period: "annual" | "quarter" = "annual",
  limit = 10
): Promise<IncomeStatement[]> {
  return get<IncomeStatement[]>(url(BASE_V3, `/income-statement/${symbol}`, { period, limit }));
}

export async function getBalanceSheet(
  symbol: string,
  period: "annual" | "quarter" = "annual",
  limit = 10
): Promise<BalanceSheetStatement[]> {
  return get<BalanceSheetStatement[]>(
    url(BASE_V3, `/balance-sheet-statement/${symbol}`, { period, limit })
  );
}

export async function getCashFlow(
  symbol: string,
  period: "annual" | "quarter" = "annual",
  limit = 10
): Promise<CashFlowStatement[]> {
  return get<CashFlowStatement[]>(
    url(BASE_V3, `/cash-flow-statement/${symbol}`, { period, limit })
  );
}

export async function getRatios(
  symbol: string,
  period: "annual" | "quarter" = "annual",
  limit = 10
): Promise<Ratio[]> {
  return get<Ratio[]>(url(BASE_V3, `/ratios/${symbol}`, { period, limit }));
}

export async function getKeyMetrics(
  symbol: string,
  period: "annual" | "quarter" = "annual",
  limit = 10
): Promise<KeyMetrics[]> {
  return get<KeyMetrics[]>(url(BASE_V3, `/key-metrics/${symbol}`, { period, limit }));
}

export async function getFinancialGrowth(
  symbol: string,
  period: "annual" | "quarter" = "annual",
  limit = 10
): Promise<FinancialGrowth[]> {
  return get<FinancialGrowth[]>(
    url(BASE_V3, `/financial-growth/${symbol}`, { period, limit })
  );
}

export async function getAnalystEstimates(symbol: string): Promise<AnalystEstimate[]> {
  return get<AnalystEstimate[]>(url(BASE_V3, `/analyst-estimates/${symbol}`, { limit: 8 }));
}

export async function getPriceTargetSummary(symbol: string): Promise<PriceTargetSummary | null> {
  try {
    const data = await get<PriceTargetSummary[] | PriceTargetSummary>(
      url(BASE_V4, "/price-target-summary", { symbol })
    );
    if (Array.isArray(data)) return data[0] ?? null;
    return data ?? null;
  } catch {
    return null;
  }
}

export async function getUpgradesDowngrades(symbol: string): Promise<UpgradeDowngrade[]> {
  try {
    return await get<UpgradeDowngrade[]>(url(BASE_V4, "/upgrades-downgrades", { symbol }));
  } catch {
    return [];
  }
}

export async function getInstitutionalHolders(symbol: string): Promise<InstitutionalHolder[]> {
  try {
    return await get<InstitutionalHolder[]>(
      url(BASE_V3, `/institutional-holder/${symbol}`)
    );
  } catch {
    return [];
  }
}

export async function getInsiderTrades(symbol: string): Promise<InsiderTrade[]> {
  try {
    return await get<InsiderTrade[]>(
      url(BASE_V4, "/insider-trading", { symbol, page: 0 })
    );
  } catch {
    return [];
  }
}

export async function getDividendHistory(symbol: string): Promise<DividendHistoryItem[]> {
  try {
    const data = await get<{ historical: DividendHistoryItem[] }>(
      url(BASE_V3, `/historical-price-full/stock_dividend/${symbol}`)
    );
    return data?.historical ?? [];
  } catch {
    return [];
  }
}

export async function getRating(symbol: string): Promise<CompanyRating | null> {
  try {
    const data = await get<CompanyRating[]>(url(BASE_V3, `/rating/${symbol}`));
    return data?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function getNews(symbol: string, limit = 12): Promise<NewsItem[]> {
  try {
    return await get<NewsItem[]>(
      url(BASE_V3, "/stock_news", { tickers: symbol, limit }),
      120
    );
  } catch {
    return [];
  }
}

export async function getPeers(symbol: string): Promise<string[]> {
  try {
    const data = await get<{ symbol: string; peersList: string[] }[]>(
      url(BASE_V4, "/stock_peers", { symbol })
    );
    return data?.[0]?.peersList ?? [];
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
