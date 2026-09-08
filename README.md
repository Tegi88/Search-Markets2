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

## Tech stack

Next.js (App Router) + TypeScript + Tailwind CSS + Recharts, backed by the
Financial Modeling Prep REST API.

This is a research tool for personal/educational use — not investment advice.
