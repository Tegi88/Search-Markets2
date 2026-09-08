import { formatCompact, formatNumber, formatPercent, formatRatio } from "./format";
import type {
  BalanceSheetStatement,
  CashFlowStatement,
  FinancialGrowth,
  IncomeStatement,
  KeyMetrics,
  Ratio,
} from "./types";
import type { TableRowConfig } from "@/components/FinancialTable";

const ratioOf = (num: keyof IncomeStatement, den: keyof IncomeStatement) => (row: IncomeStatement) => {
  const n = row[num] as number;
  const d = row[den] as number;
  return d ? n / d : undefined;
};

export const incomeRows: TableRowConfig<IncomeStatement>[] = [
  { labelKey: "revenue", key: "revenue", format: formatCompact, bold: true },
  { labelKey: "costOfRevenue", key: "costOfRevenue", format: formatCompact },
  { labelKey: "grossProfit", key: "grossProfit", format: formatCompact },
  { labelKey: "grossMargin", compute: ratioOf("grossProfit", "revenue"), format: (v) => formatPercent(v) },
  { labelKey: "rdExpense", key: "researchAndDevelopmentExpenses", format: formatCompact },
  { labelKey: "sgaExpense", key: "sellingGeneralAndAdministrativeExpenses", format: formatCompact },
  { labelKey: "operatingIncome", key: "operatingIncome", format: formatCompact, bold: true },
  { labelKey: "operatingMargin", compute: ratioOf("operatingIncome", "revenue"), format: (v) => formatPercent(v) },
  { labelKey: "ebitda", key: "ebitda", format: formatCompact },
  { labelKey: "ebitdaMargin", compute: ratioOf("ebitda", "revenue"), format: (v) => formatPercent(v) },
  { labelKey: "interestExpense", key: "interestExpense", format: formatCompact },
  { labelKey: "incomeTax", key: "incomeTaxExpense", format: formatCompact },
  { labelKey: "netIncome", key: "netIncome", format: formatCompact, bold: true },
  { labelKey: "netMargin", compute: ratioOf("netIncome", "revenue"), format: (v) => formatPercent(v) },
  { labelKey: "epsBasic", key: "eps", format: (v) => formatNumber(v) },
  { labelKey: "epsDiluted", key: "epsDiluted", format: (v) => formatNumber(v) },
  { labelKey: "sharesOutstanding", key: "weightedAverageShsOut", format: formatCompact },
];

export const balanceRows: TableRowConfig<BalanceSheetStatement>[] = [
  { labelKey: "cashEquivalents", key: "cashAndCashEquivalents", format: formatCompact },
  { labelKey: "totalCurrentAssets", key: "totalCurrentAssets", format: formatCompact },
  { labelKey: "netPPE", key: "propertyPlantEquipmentNet", format: formatCompact },
  { labelKey: "goodwillIntangibles", key: "goodwillAndIntangibleAssets", format: formatCompact },
  { labelKey: "totalAssets", key: "totalAssets", format: formatCompact, bold: true },
  { labelKey: "totalCurrentLiabilities", key: "totalCurrentLiabilities", format: formatCompact },
  { labelKey: "longTermDebt", key: "longTermDebt", format: formatCompact },
  { labelKey: "totalLiabilities", key: "totalLiabilities", format: formatCompact, bold: true },
  { labelKey: "retainedEarnings", key: "retainedEarnings", format: formatCompact },
  { labelKey: "totalStockholdersEquity", key: "totalStockholdersEquity", format: formatCompact, bold: true },
  { labelKey: "totalDebt", key: "totalDebt", format: formatCompact },
  { labelKey: "netDebt", key: "netDebt", format: formatCompact },
];

export const cashFlowRows: TableRowConfig<CashFlowStatement>[] = [
  { labelKey: "netIncome", key: "netIncome", format: formatCompact },
  { labelKey: "depreciationAmortization", key: "depreciationAndAmortization", format: formatCompact },
  { labelKey: "changeWorkingCapital", key: "changeInWorkingCapital", format: formatCompact },
  { labelKey: "operatingCashFlow", key: "netCashProvidedByOperatingActivities", format: formatCompact, bold: true },
  { labelKey: "capex", key: "capitalExpenditure", format: formatCompact },
  { labelKey: "freeCashFlow", key: "freeCashFlow", format: formatCompact, bold: true },
  { labelKey: "investingCashFlow", key: "netCashUsedForInvestingActivites", format: formatCompact },
  { labelKey: "debtRepayment", key: "debtRepayment", format: formatCompact },
  { labelKey: "stockRepurchased", key: "commonStockRepurchased", format: formatCompact },
  { labelKey: "dividendsPaid", key: "dividendsPaid", format: formatCompact },
  { labelKey: "financingCashFlow", key: "netCashUsedProvidedByFinancingActivities", format: formatCompact },
];

export const ratioRows: TableRowConfig<Ratio>[] = [
  { labelKey: "peRatio", key: "priceEarningsRatio", format: formatRatio, bold: true },
  { labelKey: "pbRatio", key: "priceToBookRatio", format: formatRatio },
  { labelKey: "psRatio", key: "priceToSalesRatio", format: formatRatio },
  { labelKey: "pfcfRatio", key: "priceToFreeCashFlowsRatio", format: formatRatio },
  { labelKey: "evEbitda", key: "enterpriseValueMultiple", format: formatRatio },
  { labelKey: "currentRatio", key: "currentRatio", format: formatRatio },
  { labelKey: "quickRatio", key: "quickRatio", format: formatRatio },
  { labelKey: "debtEquity", key: "debtEquityRatio", format: formatRatio },
  { labelKey: "grossMargin", key: "grossProfitMargin", format: (v) => formatPercent(v) },
  { labelKey: "operatingMargin", key: "operatingProfitMargin", format: (v) => formatPercent(v) },
  { labelKey: "netMargin", key: "netProfitMargin", format: (v) => formatPercent(v) },
  { labelKey: "roa", key: "returnOnAssets", format: (v) => formatPercent(v) },
  { labelKey: "roe", key: "returnOnEquity", format: (v) => formatPercent(v) },
  { labelKey: "dividendYield", key: "dividendYield", format: (v) => formatPercent(v) },
  { labelKey: "payoutRatio", key: "payoutRatio", format: (v) => formatPercent(v) },
];

export const keyMetricsRows: TableRowConfig<KeyMetrics>[] = [
  { labelKey: "revenuePerShare", key: "revenuePerShare", format: (v) => formatNumber(v) },
  { labelKey: "netIncomePerShare", key: "netIncomePerShare", format: (v) => formatNumber(v) },
  { labelKey: "marketCap", key: "marketCap", format: formatCompact },
  { labelKey: "enterpriseValue", key: "enterpriseValue", format: formatCompact },
  { labelKey: "evToSales", key: "evToSales", format: formatRatio },
  { labelKey: "evEbitda", key: "evToEbitda", format: formatRatio },
  { labelKey: "fcfYield", key: "freeCashFlowYield", format: (v) => formatPercent(v) },
  { labelKey: "debtEquity", key: "debtToEquity", format: formatRatio },
  { labelKey: "roic", key: "roic", format: (v) => formatPercent(v) },
  { labelKey: "workingCapital", key: "workingCapital", format: formatCompact },
];

export const growthRows: TableRowConfig<FinancialGrowth>[] = [
  { labelKey: "revenueGrowth", key: "revenueGrowth", format: (v) => formatPercent(v), bold: true },
  { labelKey: "grossProfitGrowth", key: "grossProfitGrowth", format: (v) => formatPercent(v) },
  { labelKey: "operatingIncomeGrowth", key: "operatingIncomeGrowth", format: (v) => formatPercent(v) },
  { labelKey: "ebitGrowth", key: "ebitgrowth", format: (v) => formatPercent(v) },
  { labelKey: "netIncomeGrowth", key: "netIncomeGrowth", format: (v) => formatPercent(v), bold: true },
  { labelKey: "epsGrowth", key: "epsgrowth", format: (v) => formatPercent(v) },
  { labelKey: "epsDilutedGrowth", key: "epsdilutedGrowth", format: (v) => formatPercent(v) },
  { labelKey: "dividendPerShareGrowth", key: "dividendsperShareGrowth", format: (v) => formatPercent(v) },
  { labelKey: "freeCashFlowGrowth", key: "freeCashFlowGrowth", format: (v) => formatPercent(v) },
];
