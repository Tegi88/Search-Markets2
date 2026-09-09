# Search Markets — Stock Research App

A GuruFocus-style stock research web app: company profile, price history, financial
statements, valuation ratios, growth & profitability, dividends, ownership/insider
activity, analyst estimates, and news — for any publicly traded company.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Get a **free** API key from [Financial Modeling Prep](https://site.financialmodelingprep.com/developer/docs/pricing)
   (no credit card required, 250 requests/day on the free tier).

3. Create `.env.local` in the project root:

   ```bash
   cp .env.example .env.local
   ```

   and paste your key:

   ```
   FMP_API_KEY=your_api_key_here
   ```

4. Run the app:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000

## Features

- **Search** any ticker or company name with live autocomplete.
- **Overview** — price chart (1M/6M/1Y/5Y/Max), company description, key stats.
- **Financials** — Income Statement, Balance Sheet, Cash Flow (multi-year).
- **Valuation** — P/E, P/B, P/S, EV/EBITDA, PEG, and full ratio history + peer comparison.
- **Growth & Profitability** — revenue/earnings growth charts, margins, ROE/ROA/ROIC.
- **Dividends** — yield, payout ratio, full dividend history.
- **Ownership & Insiders** — institutional holders and insider transactions.
- **Analyst Estimates** — price targets, EPS/revenue estimates, upgrades/downgrades, ratings.
- **News** — latest headlines for the company.
- **Watchlist** — saved locally in your browser.
- **Compare** — side-by-side comparison of any set of tickers.

## Data sources

To stay well within Financial Modeling Prep's free 250-requests/day quota,
each type of data is fetched from whichever free source covers it without a
key or a tight cap, falling back to FMP only when needed:

| Data | Primary source | Fallback |
| --- | --- | --- |
| Price history chart | Yahoo Finance (unofficial) | Stooq → FMP |
| Financial statements (US tickers) | SEC EDGAR (official, free, unlimited) | FMP |
| Quote (price/change/volume/ranges) | FMP | Yahoo Finance |
| Ratios, key metrics, growth, estimates, ownership, insiders, news, rating | FMP | — |

Yahoo's endpoint is unofficial and undocumented — it has no daily cap but
also no guarantee it keeps working. SEC EDGAR only covers US-listed filers;
everything else (ETFs, funds, foreign tickers) falls back to FMP.

Each stock page also loads lazily: the header, overview, and valuation tabs
load on open (a handful of requests), while Financials, Growth, Dividends,
Ownership, Analyst Estimates, and News each fetch their own data only the
first time you click into that tab.

## Tech stack

Next.js (App Router) + TypeScript + Tailwind CSS + Recharts.

This is a research tool for personal/educational use — not investment advice.
