"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "en" | "he";

const STORAGE_KEY = "search-markets:lang";

const dict = {
  appName: { en: "Search Markets", he: "חיפוש שווקים" },
  searchPlaceholder: { en: "Search ticker or company (e.g. AAPL, Tesla, MSFT)", he: "חפש טיקר או חברה (למשל AAPL, טסלה, MSFT)" },
  addTicker: { en: "Add ticker", he: "הוסף טיקר" },
  searching: { en: "Searching…", he: "מחפש…" },
  watchlistNav: { en: "Watchlist", he: "רשימת מעקב" },
  compareNav: { en: "Compare", he: "השוואה" },
  footerNote: {
    en: "Data provided by Financial Modeling Prep. For research and educational purposes only — not investment advice.",
    he: "הנתונים מסופקים על ידי Financial Modeling Prep. למטרות מחקר ולימוד בלבד — אין לראות בכך ייעוץ השקעות.",
  },

  heroTitle: { en: "Research any stock in seconds", he: "חקור כל מניה תוך שניות" },
  heroSubtitle: {
    en: "Financial statements, valuation ratios, growth trends, dividends, ownership, insider trades, and analyst estimates — all in one place.",
    he: "דוחות כספיים, יחסי הערכת שווי, מגמות צמיחה, דיבידנדים, בעלות, עסקאות פנים ותחזיות אנליסטים — הכל במקום אחד.",
  },
  popularStocks: { en: "Popular stocks", he: "מניות פופולריות" },
  watchlistTitle: { en: "Watchlist", he: "רשימת מעקב" },
  watchlistEmpty: {
    en: "Your watchlist is empty. Search for a stock above and add it to your watchlist.",
    he: "רשימת המעקב שלך ריקה. חפש מניה למעלה והוסף אותה לרשימת המעקב.",
  },
  symbol: { en: "Symbol", he: "טיקר" },
  name: { en: "Name", he: "שם" },
  price: { en: "Price", he: "מחיר" },
  change: { en: "Change", he: "שינוי" },
  changePct: { en: "Change %", he: "שינוי %" },
  marketCap: { en: "Market Cap", he: "שווי שוק" },
  loadingSymbol: { en: "Loading…", he: "טוען…" },

  comparePageTitle: { en: "Compare Stocks", he: "השוואת מניות" },
  addToCompare: { en: "Add tickers above to compare.", he: "הוסף טיקרים למעלה כדי להשוות." },
  yearHigh: { en: "52W High", he: "שיא 52 שבועות" },
  yearLow: { en: "52W Low", he: "שפל 52 שבועות" },
  avgVolume: { en: "Avg Volume", he: "מחזור ממוצע" },
  eps: { en: "EPS", he: "רווח למניה" },

  loading: { en: "Loading", he: "טוען" },
  couldntLoad: { en: "Couldn't load", he: "לא ניתן לטעון את" },
  noDataReturned: { en: "No data returned for this symbol.", he: "לא התקבלו נתונים עבור הטיקר הזה." },
  addApiKeyNote1: { en: "Add a free API key to", he: "הוסף מפתח API חינמי בקובץ" },
  addApiKeyNote2: { en: "as", he: "בשם" },
  getOneAt: { en: "Get one at", he: "ניתן להשיג אחד ב-" },

  tabOverview: { en: "Overview", he: "סקירה כללית" },
  tabFinancials: { en: "Financials", he: "דוחות כספיים" },
  tabValuation: { en: "Valuation", he: "הערכת שווי" },
  tabGrowth: { en: "Growth & Profitability", he: "צמיחה ורווחיות" },
  tabDividends: { en: "Dividends", he: "דיבידנדים" },
  tabOwnership: { en: "Ownership & Insiders", he: "בעלות ואנשי פנים" },
  tabAnalyst: { en: "Analyst Estimates", he: "תחזיות אנליסטים" },
  tabNews: { en: "News", he: "חדשות" },

  open: { en: "Open", he: "פתיחה" },
  prevClose: { en: "Prev Close", he: "סגירה קודמת" },
  dayRange: { en: "Day Range", he: "טווח יומי" },
  yearRange: { en: "52W Range", he: "טווח 52 שבועות" },
  volume: { en: "Volume", he: "מחזור" },
  peRatioTTM: { en: "P/E (TTM)", he: "מכפיל רווח (TTM)" },
  epsTTM: { en: "EPS (TTM)", he: "רווח למניה (TTM)" },
  beta: { en: "Beta", he: "בטא" },
  employees: { en: "Employees", he: "עובדים" },
  ipoDate: { en: "IPO Date", he: "תאריך הנפקה" },
  addToWatchlist: { en: "Add to Watchlist", he: "הוסף לרשימת מעקב" },
  inWatchlist: { en: "In Watchlist", he: "ברשימת המעקב" },
  rating: { en: "Rating", he: "דירוג" },

  priceHistory: { en: "Price History", he: "היסטוריית מחיר" },
  noPriceData: { en: "No price data available.", he: "אין נתוני מחיר זמינים." },
  loadingChart: { en: "Loading chart…", he: "טוען גרף…" },

  about: { en: "About", he: "אודות" },
  keyStatistics: { en: "Key Statistics", he: "נתונים עיקריים" },
  peRatio: { en: "P/E Ratio", he: "מכפיל רווח" },
  pbRatio: { en: "P/B Ratio", he: "מכפיל הון" },
  psRatio: { en: "P/S Ratio", he: "מכפיל מכירות" },
  evEbitda: { en: "EV/EBITDA", he: "EV/EBITDA" },
  roe: { en: "ROE", he: "תשואה על ההון (ROE)" },
  roa: { en: "ROA", he: "תשואה על הנכסים (ROA)" },
  grossMargin: { en: "Gross Margin", he: "שולי רווח גולמי" },
  netMargin: { en: "Net Margin", he: "שולי רווח נקי" },
  debtEquity: { en: "Debt / Equity", he: "חוב להון" },
  dividendYield: { en: "Dividend Yield", he: "תשואת דיבידנד" },
  enterpriseValue: { en: "Enterprise Value", he: "שווי ארגוני" },
  peerCompanies: { en: "Peer Companies", he: "חברות מתחרות" },

  incomeStatement: { en: "Income Statement", he: "דוח רווח והפסד" },
  balanceSheet: { en: "Balance Sheet", he: "מאזן" },
  cashFlow: { en: "Cash Flow", he: "תזרים מזומנים" },
  annualCurrency: { en: "Annual, in reporting currency", he: "שנתי, במטבע הדיווח" },
  noDataAvailable: { en: "No data available.", he: "אין נתונים זמינים." },
  metric: { en: "Metric", he: "מדד" },

  valuationProfitability: { en: "Valuation & Profitability Ratios", he: "יחסי הערכת שווי ורווחיות" },
  keyMetrics: { en: "Key Metrics", he: "מדדי מפתח" },
  peerComparison: { en: "Peer Comparison", he: "השוואה לחברות מתחרות" },

  revenueNetIncomeGrowth: { en: "Revenue & Net Income Growth (YoY %)", he: "צמיחת הכנסות ורווח נקי (שנה מול שנה, %)" },
  noGrowthData: { en: "No growth data available.", he: "אין נתוני צמיחה זמינים." },
  growthRates: { en: "Growth Rates", he: "שיעורי צמיחה" },
  revenue: { en: "Revenue", he: "הכנסות" },
  netIncome: { en: "Net Income", he: "רווח נקי" },
  latestRevenueGrowth: { en: "Latest revenue growth", he: "צמיחת הכנסות אחרונה" },
  latestEpsGrowth: { en: "Latest EPS growth", he: "צמיחת רווח למניה אחרונה" },

  noDividend: {
    en: "does not appear to pay a dividend, or no dividend history is available.",
    he: "כנראה לא מחלקת דיבידנד, או שאין היסטוריית דיבידנדים זמינה.",
  },
  payoutRatio: { en: "Payout Ratio", he: "יחס חלוקה" },
  latestDividend: { en: "Latest Dividend", he: "דיבידנד אחרון" },
  lastPayment: { en: "Last Payment", he: "תשלום אחרון" },
  dividendHistory: { en: "Dividend History", he: "היסטוריית דיבידנדים" },
  exDividendDate: { en: "Ex-Dividend Date", he: "תאריך אקס-דיבידנד" },
  paymentDate: { en: "Payment Date", he: "תאריך תשלום" },
  amount: { en: "Amount", he: "סכום" },

  topInstitutionalHolders: { en: "Top Institutional Holders", he: "מחזיקים מוסדיים מובילים" },
  holder: { en: "Holder", he: "מחזיק" },
  shares: { en: "Shares", he: "מניות" },
  dateReported: { en: "Date Reported", he: "תאריך דיווח" },
  noInstitutionalData: { en: "No institutional ownership data available.", he: "אין נתוני בעלות מוסדית זמינים." },
  recentInsiderTransactions: { en: "Recent Insider Transactions", he: "עסקאות אנשי פנים אחרונות" },
  insider: { en: "Insider", he: "איש פנים" },
  relationship: { en: "Relationship", he: "תפקיד" },
  transaction: { en: "Transaction", he: "עסקה" },
  sharesOwned: { en: "Shares Owned", he: "מניות בבעלות" },
  date: { en: "Date", he: "תאריך" },
  noInsiderData: { en: "No insider transaction data available.", he: "אין נתוני עסקאות פנים זמינים." },

  priceTarget: { en: "Price Target", he: "יעד מחיר" },
  currentPrice: { en: "Current Price", he: "מחיר נוכחי" },
  avgTargetQuarter: { en: "Avg Target (Last Quarter)", he: "יעד ממוצע (רבעון אחרון)" },
  avgTargetYear: { en: "Avg Target (Last Year)", he: "יעד ממוצע (שנה אחרונה)" },
  analystsLastQuarter: { en: "Analysts (Last Quarter)", he: "אנליסטים (רבעון אחרון)" },
  noPriceTargetData: { en: "No analyst price target data available.", he: "אין נתוני יעד מחיר זמינים." },
  analystRating: { en: "Analyst Rating", he: "דירוג אנליסטים" },
  overallRating: { en: "Overall Rating", he: "דירוג כללי" },
  recommendation: { en: "Recommendation", he: "המלצה" },
  score: { en: "Score", he: "ציון" },
  asOf: { en: "As of", he: "נכון לתאריך" },
  noRatingData: { en: "No rating data available.", he: "אין נתוני דירוג זמינים." },
  analystEstimates: { en: "Analyst Estimates", he: "תחזיות אנליסטים" },
  period: { en: "Period", he: "תקופה" },
  estRevenueLow: { en: "Est. Revenue (Low)", he: "הכנסה צפויה (נמוך)" },
  estRevenueAvg: { en: "Est. Revenue (Avg)", he: "הכנסה צפויה (ממוצע)" },
  estRevenueHigh: { en: "Est. Revenue (High)", he: "הכנסה צפויה (גבוה)" },
  estEpsLow: { en: "Est. EPS (Low)", he: "רו\"מ צפוי (נמוך)" },
  estEpsAvg: { en: "Est. EPS (Avg)", he: "רו\"מ צפוי (ממוצע)" },
  estEpsHigh: { en: "Est. EPS (High)", he: "רו\"מ צפוי (גבוה)" },
  numAnalysts: { en: "# Analysts", he: "מס' אנליסטים" },
  noEstimateData: { en: "No estimate data available.", he: "אין נתוני תחזיות זמינים." },
  upgradesDowngrades: { en: "Recent Upgrades / Downgrades", he: "שדרוגים / הורדות דירוג אחרונות" },
  firm: { en: "Firm", he: "בית השקעות" },
  action: { en: "Action", he: "פעולה" },
  newGrade: { en: "New Grade", he: "דירוג חדש" },
  previousGrade: { en: "Previous Grade", he: "דירוג קודם" },
  noAnalystActions: { en: "No recent analyst actions.", he: "אין פעולות אנליסטים אחרונות." },

  noNews: { en: "No recent news available.", he: "אין חדשות זמינות." },

  // Financial statement / ratio row labels
  costOfRevenue: { en: "Cost of Revenue", he: "עלות ההכנסות" },
  grossProfit: { en: "Gross Profit", he: "רווח גולמי" },
  rdExpense: { en: "R&D Expense", he: "הוצאות מו\"פ" },
  sgaExpense: { en: "SG&A Expense", he: "הוצאות מכירה, כלליות והנהלה" },
  operatingIncome: { en: "Operating Income", he: "רווח תפעולי" },
  operatingMargin: { en: "Operating Margin", he: "שולי רווח תפעולי" },
  ebitda: { en: "EBITDA", he: "EBITDA" },
  ebitdaMargin: { en: "EBITDA Margin", he: "שולי EBITDA" },
  interestExpense: { en: "Interest Expense", he: "הוצאות ריבית" },
  incomeTax: { en: "Income Tax", he: "מס הכנסה" },
  epsBasic: { en: "EPS (Basic)", he: "רווח למניה (בסיסי)" },
  epsDiluted: { en: "EPS (Diluted)", he: "רווח למניה (מדולל)" },
  sharesOutstanding: { en: "Shares Outstanding", he: "מניות במחזור" },

  cashEquivalents: { en: "Cash & Equivalents", he: "מזומנים ושווי מזומנים" },
  totalCurrentAssets: { en: "Total Current Assets", he: "סך נכסים שוטפים" },
  netPPE: { en: "Net PP&E", he: "רכוש קבוע, נטו" },
  goodwillIntangibles: { en: "Goodwill & Intangibles", he: "מוניטין ונכסים בלתי מוחשיים" },
  totalAssets: { en: "Total Assets", he: "סך נכסים" },
  totalCurrentLiabilities: { en: "Total Current Liabilities", he: "סך התחייבויות שוטפות" },
  longTermDebt: { en: "Long-Term Debt", he: "חוב לזמן ארוך" },
  totalLiabilities: { en: "Total Liabilities", he: "סך התחייבויות" },
  retainedEarnings: { en: "Retained Earnings", he: "עודפים" },
  totalStockholdersEquity: { en: "Total Stockholders' Equity", he: "סך הון עצמי" },
  totalDebt: { en: "Total Debt", he: "סך חוב" },
  netDebt: { en: "Net Debt", he: "חוב נטו" },

  depreciationAmortization: { en: "Depreciation & Amortization", he: "פחת והפחתות" },
  changeWorkingCapital: { en: "Change in Working Capital", he: "שינוי בהון חוזר" },
  operatingCashFlow: { en: "Operating Cash Flow", he: "תזרים מזומנים תפעולי" },
  capex: { en: "Capital Expenditure", he: "השקעות הוניות (CAPEX)" },
  freeCashFlow: { en: "Free Cash Flow", he: "תזרים מזומנים חופשי" },
  investingCashFlow: { en: "Investing Cash Flow", he: "תזרים מזומנים מהשקעה" },
  debtRepayment: { en: "Debt Repayment", he: "פירעון חוב" },
  stockRepurchased: { en: "Stock Repurchased", he: "רכישה עצמית של מניות" },
  dividendsPaid: { en: "Dividends Paid", he: "דיבידנדים ששולמו" },
  financingCashFlow: { en: "Financing Cash Flow", he: "תזרים מזומנים ממימון" },

  pfcfRatio: { en: "P/FCF Ratio", he: "מכפיל תזרים מזומנים חופשי" },
  currentRatio: { en: "Current Ratio", he: "יחס שוטף" },
  quickRatio: { en: "Quick Ratio", he: "יחס מהיר" },

  revenuePerShare: { en: "Revenue per Share", he: "הכנסה למניה" },
  netIncomePerShare: { en: "Net Income per Share", he: "רווח נקי למניה" },
  evToSales: { en: "EV / Sales", he: "EV / מכירות" },
  fcfYield: { en: "Free Cash Flow Yield", he: "תשואת תזרים מזומנים חופשי" },
  roic: { en: "ROIC", he: "תשואה על ההון המושקע (ROIC)" },
  workingCapital: { en: "Working Capital", he: "הון חוזר" },

  revenueGrowth: { en: "Revenue Growth", he: "צמיחת הכנסות" },
  grossProfitGrowth: { en: "Gross Profit Growth", he: "צמיחת רווח גולמי" },
  operatingIncomeGrowth: { en: "Operating Income Growth", he: "צמיחת רווח תפעולי" },
  ebitGrowth: { en: "EBIT Growth", he: "צמיחת EBIT" },
  netIncomeGrowth: { en: "Net Income Growth", he: "צמיחת רווח נקי" },
  epsGrowth: { en: "EPS Growth", he: "צמיחת רווח למניה" },
  epsDilutedGrowth: { en: "EPS Diluted Growth", he: "צמיחת רווח למניה (מדולל)" },
  dividendPerShareGrowth: { en: "Dividend per Share Growth", he: "צמיחת דיבידנד למניה" },
  freeCashFlowGrowth: { en: "Free Cash Flow Growth", he: "צמיחת תזרים מזומנים חופשי" },
} as const;

export type TranslationKey = keyof typeof dict;

interface LanguageContextValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  toggle: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored === "en" || stored === "he") setLang(stored);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
  }, [lang]);

  const toggle = useCallback(() => {
    setLang((prev) => {
      const next = prev === "en" ? "he" : "en";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const t = useCallback((key: TranslationKey) => dict[key][lang], [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, dir: lang === "he" ? "rtl" : "ltr", toggle, t }),
    [lang, toggle, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
