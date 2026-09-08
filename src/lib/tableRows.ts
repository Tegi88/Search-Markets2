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

export const incomeRows: TableRowConfig<IncomeStatement>[] = [
  { label: "Revenue", key: "revenue", format: formatCompact, bold: true },
  { label: "Cost of Revenue", key: "costOfRevenue", format: formatCompact },
  { label: "Gross Profit", key: "grossProfit", format: formatCompact },
  { label: "Gross Margin", key: "grossProfitRatio", format: (v) => formatPercent(v) },
  { label: "R&D Expense", key: "researchAndDevelopmentExpenses", format: formatCompact },
  { label: "SG&A Expense", key: "sellingGeneralAndAdministrativeExpenses", format: formatCompact },
  { label: "Operating Income", key: "operatingIncome", format: formatCompact, bold: true },
  { label: "Operating Margin", key: "operatingIncomeRatio", format: (v) => formatPercent(v) },
  { label: "EBITDA", key: "ebitda", format: formatCompact },
  { label: "EBITDA Margin", key: "ebitdaratio", format: (v) => formatPercent(v) },
  { label: "Interest Expense", key: "interestExpense", format: formatCompact },
  { label: "Income Tax", key: "incomeTaxExpense", format: formatCompact },
  { label: "Net Income", key: "netIncome", format: formatCompact, bold: true },
  { label: "Net Margin", key: "netIncomeRatio", format: (v) => formatPercent(v) },
  { label: "EPS (Basic)", key: "eps", format: (v) => formatNumber(v) },
  { label: "EPS (Diluted)", key: "epsdiluted", format: (v) => formatNumber(v) },
  { label: "Shares Outstanding", key: "weightedAverageShsOut", format: formatCompact },
];

export const balanceRows: TableRowConfig<BalanceSheetStatement>[] = [
  { label: "Cash & Equivalents", key: "cashAndCashEquivalents", format: formatCompact },
  { label: "Total Current Assets", key: "totalCurrentAssets", format: formatCompact },
  { label: "Net PP&E", key: "propertyPlantEquipmentNet", format: formatCompact },
  { label: "Goodwill & Intangibles", key: "goodwillAndIntangibleAssets", format: formatCompact },
  { label: "Total Assets", key: "totalAssets", format: formatCompact, bold: true },
  { label: "Total Current Liabilities", key: "totalCurrentLiabilities", format: formatCompact },
  { label: "Long-Term Debt", key: "longTermDebt", format: formatCompact },
  { label: "Total Liabilities", key: "totalLiabilities", format: formatCompact, bold: true },
  { label: "Retained Earnings", key: "retainedEarnings", format: formatCompact },
  { label: "Total Stockholders' Equity", key: "totalStockholdersEquity", format: formatCompact, bold: true },
  { label: "Total Debt", key: "totalDebt", format: formatCompact },
  { label: "Net Debt", key: "netDebt", format: formatCompact },
];

export const cashFlowRows: TableRowConfig<CashFlowStatement>[] = [
  { label: "Net Income", key: "netIncome", format: formatCompact },
  { label: "Depreciation & Amortization", key: "depreciationAndAmortization", format: formatCompact },
  { label: "Change in Working Capital", key: "changeInWorkingCapital", format: formatCompact },
  { label: "Operating Cash Flow", key: "netCashProvidedByOperatingActivities", format: formatCompact, bold: true },
  { label: "Capital Expenditure", key: "capitalExpenditure", format: formatCompact },
  { label: "Free Cash Flow", key: "freeCashFlow", format: formatCompact, bold: true },
  { label: "Investing Cash Flow", key: "netCashUsedForInvestingActivites", format: formatCompact },
  { label: "Debt Repayment", key: "debtRepayment", format: formatCompact },
  { label: "Stock Repurchased", key: "commonStockRepurchased", format: formatCompact },
  { label: "Dividends Paid", key: "dividendsPaid", format: formatCompact },
  { label: "Financing Cash Flow", key: "netCashUsedProvidedByFinancingActivities", format: formatCompact },
];

export const ratioRows: TableRowConfig<Ratio>[] = [
  { label: "P/E Ratio", key: "priceEarningsRatio", format: formatRatio, bold: true },
  { label: "P/B Ratio", key: "priceToBookRatio", format: formatRatio },
  { label: "P/S Ratio", key: "priceToSalesRatio", format: formatRatio },
  { label: "P/FCF Ratio", key: "priceToFreeCashFlowsRatio", format: formatRatio },
  { label: "EV/EBITDA", key: "enterpriseValueMultiple", format: formatRatio },
  { label: "Current Ratio", key: "currentRatio", format: formatRatio },
  { label: "Quick Ratio", key: "quickRatio", format: formatRatio },
  { label: "Debt / Equity", key: "debtEquityRatio", format: formatRatio },
  { label: "Gross Margin", key: "grossProfitMargin", format: (v) => formatPercent(v) },
  { label: "Operating Margin", key: "operatingProfitMargin", format: (v) => formatPercent(v) },
  { label: "Net Margin", key: "netProfitMargin", format: (v) => formatPercent(v) },
  { label: "Return on Assets (ROA)", key: "returnOnAssets", format: (v) => formatPercent(v) },
  { label: "Return on Equity (ROE)", key: "returnOnEquity", format: (v) => formatPercent(v) },
  { label: "Dividend Yield", key: "dividendYield", format: (v) => formatPercent(v) },
  { label: "Payout Ratio", key: "payoutRatio", format: (v) => formatPercent(v) },
];

export const keyMetricsRows: TableRowConfig<KeyMetrics>[] = [
  { label: "Revenue per Share", key: "revenuePerShare", format: (v) => formatNumber(v) },
  { label: "Net Income per Share", key: "netIncomePerShare", format: (v) => formatNumber(v) },
  { label: "Market Cap", key: "marketCap", format: formatCompact },
  { label: "Enterprise Value", key: "enterpriseValue", format: formatCompact },
  { label: "EV / Sales", key: "evToSales", format: formatRatio },
  { label: "EV / EBITDA", key: "evToEbitda", format: formatRatio },
  { label: "Free Cash Flow Yield", key: "freeCashFlowYield", format: (v) => formatPercent(v) },
  { label: "Debt / Equity", key: "debtToEquity", format: formatRatio },
  { label: "ROIC", key: "roic", format: (v) => formatPercent(v) },
  { label: "Working Capital", key: "workingCapital", format: formatCompact },
];

export const growthRows: TableRowConfig<FinancialGrowth>[] = [
  { label: "Revenue Growth", key: "revenueGrowth", format: (v) => formatPercent(v), bold: true },
  { label: "Gross Profit Growth", key: "grossProfitGrowth", format: (v) => formatPercent(v) },
  { label: "Operating Income Growth", key: "operatingIncomeGrowth", format: (v) => formatPercent(v) },
  { label: "EBIT Growth", key: "ebitgrowth", format: (v) => formatPercent(v) },
  { label: "Net Income Growth", key: "netIncomeGrowth", format: (v) => formatPercent(v), bold: true },
  { label: "EPS Growth", key: "epsgrowth", format: (v) => formatPercent(v) },
  { label: "EPS Diluted Growth", key: "epsdilutedGrowth", format: (v) => formatPercent(v) },
  { label: "Dividend per Share Growth", key: "dividendsperShareGrowth", format: (v) => formatPercent(v) },
  { label: "Free Cash Flow Growth", key: "freeCashFlowGrowth", format: (v) => formatPercent(v) },
];
