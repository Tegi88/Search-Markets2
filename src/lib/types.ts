export interface SearchResult {
  symbol: string;
  name: string;
  currency?: string;
  stockExchange?: string;
  exchangeShortName?: string;
}

export interface CompanyProfile {
  symbol: string;
  companyName: string;
  price: number;
  changes: number;
  changesPercentage?: number;
  currency: string;
  cik?: string;
  isin?: string;
  exchangeShortName: string;
  industry: string;
  sector: string;
  country: string;
  website: string;
  description: string;
  ceo: string;
  fullTimeEmployees: string;
  image: string;
  ipoDate: string;
  mktCap: number;
  beta: number;
  volAvg: number;
  range: string;
  dcf?: number;
  dcfDiff?: number;
  isEtf?: boolean;
  isFund?: boolean;
}

export interface Quote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  // Not returned by FMP's stable /quote endpoint on the free plan — left
  // optional and backfilled from the income statement where possible.
  avgVolume?: number;
  open: number;
  previousClose: number;
  eps?: number;
  pe?: number;
  earningsAnnouncement?: string;
  sharesOutstanding?: number;
  exchange?: string;
  timestamp?: number;
}

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose?: number;
  volume: number;
}

export interface IncomeStatement {
  date: string;
  period: string;
  fiscalYear?: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  researchAndDevelopmentExpenses: number;
  sellingGeneralAndAdministrativeExpenses: number;
  operatingExpenses: number;
  operatingIncome: number;
  interestExpense: number;
  ebitda: number;
  netIncome: number;
  eps: number;
  epsDiluted: number;
  weightedAverageShsOut: number;
  incomeTaxExpense: number;
}

export interface BalanceSheetStatement {
  date: string;
  period: string;
  calendarYear?: string;
  cashAndCashEquivalents: number;
  totalCurrentAssets: number;
  propertyPlantEquipmentNet: number;
  goodwillAndIntangibleAssets: number;
  totalAssets: number;
  totalCurrentLiabilities: number;
  longTermDebt: number;
  totalLiabilities: number;
  retainedEarnings: number;
  totalStockholdersEquity: number;
  totalDebt: number;
  netDebt: number;
}

export interface CashFlowStatement {
  date: string;
  period: string;
  calendarYear?: string;
  netIncome: number;
  depreciationAndAmortization: number;
  changeInWorkingCapital: number;
  netCashProvidedByOperatingActivities: number;
  capitalExpenditure: number;
  netCashUsedForInvestingActivites: number;
  debtRepayment: number;
  commonStockRepurchased: number;
  dividendsPaid: number;
  netCashUsedProvidedByFinancingActivities: number;
  freeCashFlow: number;
}

export interface RatiosTTM {
  [key: string]: number;
}

export interface Ratio {
  date: string;
  period: string;
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  grossProfitMargin: number;
  operatingProfitMargin: number;
  netProfitMargin: number;
  returnOnAssets: number;
  returnOnEquity: number;
  returnOnCapitalEmployed?: number;
  debtRatio: number;
  debtEquityRatio: number;
  priceEarningsRatio: number;
  priceToBookRatio: number;
  priceToSalesRatio: number;
  priceToFreeCashFlowsRatio: number;
  enterpriseValueMultiple: number;
  dividendYield: number;
  payoutRatio: number;
}

export interface KeyMetrics {
  date: string;
  period: string;
  revenuePerShare: number;
  netIncomePerShare: number;
  marketCap: number;
  enterpriseValue: number;
  peRatio: number;
  pbRatio: number;
  evToSales: number;
  evToEbitda: number;
  freeCashFlowYield: number;
  debtToEquity: number;
  currentRatio: number;
  roic: number;
  workingCapital: number;
  bookValuePerShare?: number;
}

export interface FinancialGrowth {
  date: string;
  period: string;
  revenueGrowth: number;
  grossProfitGrowth: number;
  ebitgrowth: number;
  operatingIncomeGrowth: number;
  netIncomeGrowth: number;
  epsgrowth: number;
  epsdilutedGrowth: number;
  dividendsperShareGrowth: number;
  freeCashFlowGrowth: number;
}

export interface AnalystEstimate {
  date: string;
  estimatedRevenueAvg: number;
  estimatedRevenueLow: number;
  estimatedRevenueHigh: number;
  estimatedEpsAvg: number;
  estimatedEpsLow: number;
  estimatedEpsHigh: number;
  numberAnalystEstimatedRevenue: number;
  numberAnalystsEstimatedEps: number;
}

export interface PriceTargetSummary {
  symbol: string;
  lastMonthCount?: number;
  lastMonthAvgPriceTarget?: number;
  lastQuarterCount?: number;
  lastQuarterAvgPriceTarget?: number;
  lastYearCount?: number;
  lastYearAvgPriceTarget?: number;
  allTimeCount?: number;
  allTimeAvgPriceTarget?: number;
}

export interface UpgradeDowngrade {
  symbol: string;
  publishedDate: string;
  newsURL?: string;
  newGrade: string;
  previousGrade?: string;
  gradingCompany: string;
  action: string;
}

export interface InstitutionalHolder {
  holder: string;
  shares: number;
  dateReported: string;
  change: number;
}

export interface InsiderTrade {
  symbol: string;
  filingDate: string;
  transactionDate: string;
  reportingName: string;
  typeOfOwner: string;
  transactionType: string;
  securitiesTransacted: number;
  price: number;
  securitiesOwned: number;
}

export interface DividendHistoryItem {
  date: string;
  label?: string;
  adjDividend: number;
  dividend: number;
  recordDate?: string;
  paymentDate?: string;
  declarationDate?: string;
}

export interface CompanyRating {
  symbol: string;
  date: string;
  rating: string;
  ratingScore: number;
  ratingRecommendation: string;
  ratingDetailsDCFScore?: number;
  ratingDetailsROEScore?: number;
  ratingDetailsROAScore?: number;
  ratingDetailsDEScore?: number;
  ratingDetailsPEScore?: number;
  ratingDetailsPBScore?: number;
}

export interface NewsItem {
  symbol: string;
  publishedDate: string;
  title: string;
  image?: string;
  site: string;
  text: string;
  url: string;
}

export interface StockPeers {
  symbol: string;
  peersList: string[];
}

export interface FullStockData {
  symbol: string;
  profile: CompanyProfile | null;
  quote: Quote | null;
  income: IncomeStatement[];
  incomeQuarterly: IncomeStatement[];
  balance: BalanceSheetStatement[];
  cashflow: CashFlowStatement[];
  ratios: Ratio[];
  keyMetrics: KeyMetrics[];
  growth: FinancialGrowth[];
  estimates: AnalystEstimate[];
  priceTarget: PriceTargetSummary | null;
  upgradesDowngrades: UpgradeDowngrade[];
  institutionalHolders: InstitutionalHolder[];
  insiderTrades: InsiderTrade[];
  dividends: DividendHistoryItem[];
  rating: CompanyRating | null;
  news: NewsItem[];
  peers: string[];
}
