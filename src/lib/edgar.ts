import type {
  BalanceSheetStatement,
  CashFlowStatement,
  FinancialGrowth,
  IncomeStatement,
  KeyMetrics,
  Quote,
  Ratio,
} from "./types";

// SEC EDGAR's XBRL API: official, free, and effectively unlimited — but
// SEC's fair-access policy (sec.gov/os/webmaster-faq#developers) actively
// 403s requests whose User-Agent doesn't match their expected
// "Company Name AdminContact@domain.com" shape. Set SEC_EDGAR_USER_AGENT
// to your own contact info for best reliability; this default is enough
// to pass their format check either way.
export const EDGAR_UA = process.env.SEC_EDGAR_USER_AGENT || "SearchMarkets contact@searchmarkets.app";
const HEADERS = { "User-Agent": EDGAR_UA, Accept: "application/json", "Accept-Encoding": "gzip, deflate" };

interface TickerEntry {
  cik_str: number;
  ticker: string;
  title: string;
}

let cikMapPromise: Promise<Map<string, string>> | null = null;

async function loadCikMap(): Promise<Map<string, string>> {
  const res = await fetch("https://www.sec.gov/files/company_tickers.json", {
    headers: HEADERS,
    next: { revalidate: 86400 },
  });
  if (!res.ok) {
    throw new Error(`SEC company_tickers.json failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as Record<string, TickerEntry>;
  const map = new Map<string, string>();
  for (const entry of Object.values(json)) {
    map.set(entry.ticker.toUpperCase(), String(entry.cik_str).padStart(10, "0"));
  }
  return map;
}

/** Throws (rather than returning null) so callers can surface exactly why
 * EDGAR wasn't used — unreachable vs. not a US-listed filer are both
 * useful to distinguish when diagnosing an empty Financials tab. */
export async function getCik(symbol: string): Promise<string> {
  if (!cikMapPromise) cikMapPromise = loadCikMap();
  const map = await cikMapPromise;
  const cik = map.get(symbol.toUpperCase());
  if (!cik) throw new Error(`No SEC CIK for ${symbol} (not a US-listed filer, or an ETF/fund)`);
  return cik;
}

interface XbrlFact {
  end: string;
  start?: string;
  val: number;
  fy: number;
  fp: string;
  form: string;
  filed: string;
}

interface CompanyFacts {
  facts?: {
    "us-gaap"?: Record<string, { units: Record<string, XbrlFact[]> }>;
  };
}

const factsCache = new Map<string, Promise<CompanyFacts>>();

async function loadCompanyFacts(cik: string): Promise<CompanyFacts> {
  if (!factsCache.has(cik)) {
    factsCache.set(
      cik,
      fetch(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`, {
        headers: HEADERS,
        next: { revalidate: 86400 },
      }).then((res) => {
        if (!res.ok) {
          factsCache.delete(cik);
          throw new Error(`SEC companyfacts failed for CIK${cik}: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
    );
  }
  return factsCache.get(cik)!;
}

/** Picks the first concept (from most to least preferred) that has annual
 * (10-K, full fiscal year) data, and returns one value per fiscal year —
 * the most recently filed value when a year was restated. */
function extractAnnual(facts: CompanyFacts, concepts: string[]): Map<number, { date: string; val: number }> {
  const byYear = new Map<number, { date: string; val: number; filed: string }>();
  for (const concept of concepts) {
    const units = facts.facts?.["us-gaap"]?.[concept]?.units;
    if (!units) continue;
    const series = units.USD || units["USD/shares"] || units.shares || Object.values(units)[0];
    if (!series) continue;
    for (const f of series) {
      if (!f.form?.startsWith("10-K")) continue;
      if (f.fp !== "FY") continue;
      const existing = byYear.get(f.fy);
      if (!existing || f.filed > existing.filed) {
        byYear.set(f.fy, { date: f.end, val: f.val, filed: f.filed });
      }
    }
    if (byYear.size > 0) break; // found data under this concept name, don't dilute with a less-preferred alias
  }
  const result = new Map<number, { date: string; val: number }>();
  for (const [fy, v] of byYear) result.set(fy, { date: v.date, val: v.val });
  return result;
}

function mergeByYear(
  fields: Record<string, Map<number, { date: string; val: number }>>
): Record<string, unknown>[] {
  const years = new Set<number>();
  for (const m of Object.values(fields)) for (const fy of m.keys()) years.add(fy);
  const sortedYears = [...years].sort((a, b) => b - a).slice(0, 10);

  return sortedYears.map((fy) => {
    let date = "";
    const row: Record<string, unknown> = {};
    for (const [key, m] of Object.entries(fields)) {
      const entry = m.get(fy);
      if (entry) {
        row[key] = entry.val;
        if (!date || entry.date > date) date = entry.date;
      }
    }
    row.date = date;
    row.period = "FY";
    row.fiscalYear = String(fy);
    return row;
  });
}

export async function getEdgarIncomeStatement(symbol: string): Promise<IncomeStatement[]> {
  const cik = await getCik(symbol);
  const facts = await loadCompanyFacts(cik);

  const rows = mergeByYear({
    revenue: extractAnnual(facts, [
      "Revenues",
      "RevenueFromContractWithCustomerExcludingAssessedTax",
      "RevenueFromContractWithCustomerIncludingAssessedTax",
      "SalesRevenueNet",
    ]),
    costOfRevenue: extractAnnual(facts, ["CostOfRevenue", "CostOfGoodsAndServicesSold", "CostOfGoodsSold"]),
    grossProfit: extractAnnual(facts, ["GrossProfit"]),
    researchAndDevelopmentExpenses: extractAnnual(facts, ["ResearchAndDevelopmentExpense"]),
    sellingGeneralAndAdministrativeExpenses: extractAnnual(facts, [
      "SellingGeneralAndAdministrativeExpense",
      "GeneralAndAdministrativeExpense",
    ]),
    operatingIncome: extractAnnual(facts, ["OperatingIncomeLoss"]),
    interestExpense: extractAnnual(facts, ["InterestExpense", "InterestExpenseDebt"]),
    incomeTaxExpense: extractAnnual(facts, ["IncomeTaxExpenseBenefit"]),
    netIncome: extractAnnual(facts, ["NetIncomeLoss", "ProfitLoss"]),
    eps: extractAnnual(facts, ["EarningsPerShareBasic"]),
    epsDiluted: extractAnnual(facts, ["EarningsPerShareDiluted"]),
    weightedAverageShsOut: extractAnnual(facts, [
      "WeightedAverageNumberOfSharesOutstandingBasic",
      "WeightedAverageNumberOfDilutedSharesOutstanding",
    ]),
    depreciationAndAmortization: extractAnnual(facts, [
      "DepreciationDepletionAndAmortization",
      "DepreciationAmortizationAndAccretionNet",
      "DepreciationAndAmortization",
    ]),
  }) as unknown as (IncomeStatement & { depreciationAndAmortization?: number })[];

  for (const row of rows) {
    if (row.grossProfit === undefined && row.revenue !== undefined && row.costOfRevenue !== undefined) {
      row.grossProfit = row.revenue - row.costOfRevenue;
    }
    if (row.operatingIncome !== undefined && row.depreciationAndAmortization !== undefined) {
      row.ebitda = row.operatingIncome + row.depreciationAndAmortization;
    }
  }

  return rows.filter((r) => r.revenue !== undefined || r.netIncome !== undefined);
}

export async function getEdgarBalanceSheet(symbol: string): Promise<BalanceSheetStatement[]> {
  const cik = await getCik(symbol);
  const facts = await loadCompanyFacts(cik);

  const rows = mergeByYear({
    cashAndCashEquivalents: extractAnnual(facts, [
      "CashAndCashEquivalentsAtCarryingValue",
      "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents",
    ]),
    totalCurrentAssets: extractAnnual(facts, ["AssetsCurrent"]),
    totalAssets: extractAnnual(facts, ["Assets"]),
    totalCurrentLiabilities: extractAnnual(facts, ["LiabilitiesCurrent"]),
    longTermDebt: extractAnnual(facts, ["LongTermDebtNoncurrent", "LongTermDebt"]),
    totalLiabilities: extractAnnual(facts, ["Liabilities"]),
    retainedEarnings: extractAnnual(facts, ["RetainedEarningsAccumulatedDeficit"]),
    totalStockholdersEquity: extractAnnual(facts, [
      "StockholdersEquity",
      "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest",
    ]),
  }) as unknown as BalanceSheetStatement[];

  return rows.filter((r) => r.totalAssets !== undefined);
}

export async function getEdgarCashFlow(symbol: string): Promise<CashFlowStatement[]> {
  const cik = await getCik(symbol);
  const facts = await loadCompanyFacts(cik);

  const rows = mergeByYear({
    netIncome: extractAnnual(facts, ["NetIncomeLoss", "ProfitLoss"]),
    depreciationAndAmortization: extractAnnual(facts, [
      "DepreciationDepletionAndAmortization",
      "DepreciationAmortizationAndAccretionNet",
    ]),
    netCashProvidedByOperatingActivities: extractAnnual(facts, [
      "NetCashProvidedByUsedInOperatingActivities",
      "NetCashProvidedByUsedInOperatingActivitiesContinuingOperations",
    ]),
    capitalExpenditure: extractAnnual(facts, [
      "PaymentsToAcquirePropertyPlantAndEquipment",
      "PaymentsToAcquireProductiveAssets",
    ]),
    netCashUsedForInvestingActivites: extractAnnual(facts, [
      "NetCashProvidedByUsedInInvestingActivities",
      "NetCashProvidedByUsedInInvestingActivitiesContinuingOperations",
    ]),
    netCashUsedProvidedByFinancingActivities: extractAnnual(facts, [
      "NetCashProvidedByUsedInFinancingActivities",
      "NetCashProvidedByUsedInFinancingActivitiesContinuingOperations",
    ]),
    dividendsPaid: extractAnnual(facts, ["PaymentsOfDividends", "PaymentsOfDividendsCommonStock"]),
    commonStockRepurchased: extractAnnual(facts, ["PaymentsForRepurchaseOfCommonStock"]),
  }) as unknown as CashFlowStatement[];

  for (const row of rows) {
    // Capex is reported as a positive outflow amount by most filers.
    if (row.capitalExpenditure !== undefined && row.capitalExpenditure > 0) {
      row.capitalExpenditure = -row.capitalExpenditure;
    }
    if (row.netCashProvidedByOperatingActivities !== undefined && row.capitalExpenditure !== undefined) {
      row.freeCashFlow = row.netCashProvidedByOperatingActivities + row.capitalExpenditure;
    }
  }

  return rows.filter((r) => r.netCashProvidedByOperatingActivities !== undefined);
}

const div = (n: number | undefined, d: number | undefined): number =>
  n !== undefined && d ? n / d : NaN;

/**
 * FMP's free plan doesn't include /ratios or /key-metrics at all (a
 * permanent 402, not a quota issue), so these are computed directly from
 * EDGAR's income statement + balance sheet instead. Margins, ROE/ROA,
 * leverage, and per-share figures are exact for every year; price-based
 * ratios (P/E, P/B, EV/EBITDA, ...) only use the *current* quote, so
 * they're only meaningful for the most recent year — older years show
 * "—" rather than a ratio computed against today's price.
 */
export async function getEdgarRatiosAndMetrics(
  symbol: string,
  quote: Quote | null
): Promise<{ ratios: Ratio[]; keyMetrics: KeyMetrics[] }> {
  const [income, balance, cashflow] = await Promise.all([
    getEdgarIncomeStatement(symbol),
    getEdgarBalanceSheet(symbol),
    getEdgarCashFlow(symbol),
  ]);
  if (income.length === 0 || balance.length === 0) return { ratios: [], keyMetrics: [] };

  const balanceByDate = new Map(balance.map((b) => [b.date, b]));
  const cashflowByDate = new Map(cashflow.map((c) => [c.date, c]));

  const ratios: Ratio[] = [];
  const keyMetrics: KeyMetrics[] = [];

  income.forEach((inc, i) => {
    const bal = balanceByDate.get(inc.date);
    if (!bal) return;
    const cf = cashflowByDate.get(inc.date);

    const isLatest = i === 0;
    const price = isLatest ? quote?.price : undefined;
    const marketCap = isLatest ? quote?.marketCap : undefined;
    const totalDebt = bal.longTermDebt;
    const cash = bal.cashAndCashEquivalents;
    const enterpriseValue =
      marketCap !== undefined && totalDebt !== undefined && cash !== undefined
        ? marketCap + totalDebt - cash
        : undefined;
    const bookValuePerShare =
      bal.totalStockholdersEquity !== undefined && inc.weightedAverageShsOut
        ? bal.totalStockholdersEquity / inc.weightedAverageShsOut
        : undefined;

    ratios.push({
      date: inc.date,
      period: "FY",
      currentRatio: div(bal.totalCurrentAssets, bal.totalCurrentLiabilities),
      quickRatio: NaN,
      cashRatio: NaN,
      grossProfitMargin: div(inc.grossProfit, inc.revenue),
      operatingProfitMargin: div(inc.operatingIncome, inc.revenue),
      netProfitMargin: div(inc.netIncome, inc.revenue),
      returnOnAssets: div(inc.netIncome, bal.totalAssets),
      returnOnEquity: div(inc.netIncome, bal.totalStockholdersEquity),
      debtRatio: div(totalDebt, bal.totalAssets),
      debtEquityRatio: div(totalDebt, bal.totalStockholdersEquity),
      priceEarningsRatio: div(price, inc.eps),
      priceToBookRatio: price !== undefined ? div(price, bookValuePerShare) : NaN,
      priceToSalesRatio: div(marketCap, inc.revenue),
      priceToFreeCashFlowsRatio: div(marketCap, cf?.freeCashFlow),
      enterpriseValueMultiple: div(enterpriseValue, inc.ebitda),
      dividendYield: NaN,
      payoutRatio: NaN,
    });

    keyMetrics.push({
      date: inc.date,
      period: "FY",
      revenuePerShare: div(inc.revenue, inc.weightedAverageShsOut),
      netIncomePerShare: inc.eps ?? NaN,
      marketCap: marketCap ?? NaN,
      enterpriseValue: enterpriseValue ?? NaN,
      peRatio: div(price, inc.eps),
      pbRatio: price !== undefined ? div(price, bookValuePerShare) : NaN,
      evToSales: div(enterpriseValue, inc.revenue),
      evToEbitda: div(enterpriseValue, inc.ebitda),
      freeCashFlowYield: div(cf?.freeCashFlow, marketCap),
      debtToEquity: div(totalDebt, bal.totalStockholdersEquity),
      currentRatio: div(bal.totalCurrentAssets, bal.totalCurrentLiabilities),
      roic: NaN,
      workingCapital:
        bal.totalCurrentAssets !== undefined && bal.totalCurrentLiabilities !== undefined
          ? bal.totalCurrentAssets - bal.totalCurrentLiabilities
          : NaN,
      bookValuePerShare,
    });
  });

  return { ratios, keyMetrics };
}

/** Same rationale as above — FMP's /financial-growth is permanently
 * unavailable on the free plan, so year-over-year growth is computed
 * directly from EDGAR's income statement (newest-first, like FMP's). */
export async function getEdgarGrowth(symbol: string): Promise<FinancialGrowth[]> {
  const income = await getEdgarIncomeStatement(symbol);
  const growth: FinancialGrowth[] = [];

  for (let i = 0; i < income.length - 1; i++) {
    const cur = income[i];
    const prev = income[i + 1];
    growth.push({
      date: cur.date,
      period: "FY",
      revenueGrowth: div(cur.revenue !== undefined && prev.revenue !== undefined ? cur.revenue - prev.revenue : undefined, prev.revenue),
      grossProfitGrowth: div(
        cur.grossProfit !== undefined && prev.grossProfit !== undefined ? cur.grossProfit - prev.grossProfit : undefined,
        prev.grossProfit
      ),
      ebitgrowth: div(cur.ebitda !== undefined && prev.ebitda !== undefined ? cur.ebitda - prev.ebitda : undefined, prev.ebitda),
      operatingIncomeGrowth: div(
        cur.operatingIncome !== undefined && prev.operatingIncome !== undefined
          ? cur.operatingIncome - prev.operatingIncome
          : undefined,
        prev.operatingIncome
      ),
      netIncomeGrowth: div(
        cur.netIncome !== undefined && prev.netIncome !== undefined ? cur.netIncome - prev.netIncome : undefined,
        prev.netIncome
      ),
      epsgrowth: div(cur.eps !== undefined && prev.eps !== undefined ? cur.eps - prev.eps : undefined, prev.eps),
      epsdilutedGrowth: div(
        cur.epsDiluted !== undefined && prev.epsDiluted !== undefined ? cur.epsDiluted - prev.epsDiluted : undefined,
        prev.epsDiluted
      ),
      dividendsperShareGrowth: NaN,
      freeCashFlowGrowth: NaN,
    });
  }

  return growth;
}
