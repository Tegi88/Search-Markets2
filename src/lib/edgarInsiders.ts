import type { InsiderTrade } from "./types";
import { EDGAR_UA, getCik } from "./edgar";

const JSON_HEADERS = { "User-Agent": EDGAR_UA, Accept: "application/json" };
const XML_HEADERS = { "User-Agent": EDGAR_UA, Accept: "application/xml,text/xml,*/*" };

interface RecentFilings {
  filings?: {
    recent?: {
      form: string[];
      accessionNumber: string[];
      filingDate: string[];
      primaryDocument: string[];
    };
  };
}

const TRANSACTION_CODES: Record<string, string> = {
  P: "Buy (open market)",
  S: "Sale (open market)",
  A: "Grant/Award",
  D: "Disposition (gift/other)",
  F: "Tax withholding",
  M: "Option exercise",
  G: "Gift",
  C: "Conversion",
  X: "Option exercise",
};

/** SEC's per-filer index of everything they've submitted — includes a
 * rolling window of recent filings (enough for "recent insider activity"). */
async function getRecentFilings(cik: string): Promise<RecentFilings> {
  const res = await fetch(`https://data.sec.gov/submissions/CIK${cik}.json`, {
    headers: JSON_HEADERS,
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`SEC submissions failed for CIK${cik}: ${res.status} ${res.statusText}`);
  return res.json();
}

function tag(xml: string, name: string): string | undefined {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? m[1].trim() : undefined;
}

/** The Form 4 XML schema nests most leaf values in a <value> child, e.g.
 * <transactionShares><value>1000</value></transactionShares>. */
function tagValue(xml: string, name: string): string | undefined {
  const block = tag(xml, name);
  if (block === undefined) return undefined;
  return tag(block, "value") ?? block;
}

function parseForm4(xml: string, symbol: string, filingDate: string): InsiderTrade[] {
  const reportingName = tag(xml, "rptOwnerName") ?? "Unknown";
  const relationship = tag(xml, "reportingOwnerRelationship") ?? "";
  const isDirector = tag(relationship, "isDirector") === "1";
  const isOfficer = tag(relationship, "isOfficer") === "1";
  const isTenPercent = tag(relationship, "isTenPercentOwner") === "1";
  const officerTitle = tag(relationship, "officerTitle");
  const typeOfOwner =
    officerTitle?.trim() ||
    [isDirector && "Director", isOfficer && "Officer", isTenPercent && "10% Owner"].filter(Boolean).join(", ") ||
    "Insider";

  const trades: InsiderTrade[] = [];
  const transactionBlocks = xml.match(/<nonDerivativeTransaction>[\s\S]*?<\/nonDerivativeTransaction>/gi) ?? [];

  for (const block of transactionBlocks) {
    const transactionDate = tagValue(block, "transactionDate") ?? filingDate;
    const code = tag(block, "transactionCode")?.trim().toUpperCase();
    const shares = Number(tagValue(block, "transactionShares"));
    const price = Number(tagValue(block, "transactionPricePerShare"));
    const owned = Number(tagValue(block, "sharesOwnedFollowingTransaction"));
    const acquiredDisposed = tag(block, "transactionAcquiredDisposedCode");
    const disposed = acquiredDisposed?.includes("D");

    trades.push({
      symbol,
      filingDate,
      transactionDate,
      reportingName,
      typeOfOwner,
      transactionType: code ? TRANSACTION_CODES[code] ?? code : disposed ? "Disposition" : "Acquisition",
      securitiesTransacted: Number.isFinite(shares) ? shares : 0,
      price: Number.isFinite(price) ? price : 0,
      securitiesOwned: Number.isFinite(owned) ? owned : 0,
    });
  }

  return trades;
}

async function fetchAndParseForm4(
  cikNum: string,
  accessionNumber: string,
  primaryDocument: string,
  filingDate: string,
  symbol: string
): Promise<InsiderTrade[]> {
  const accNoDashes = accessionNumber.replace(/-/g, "");
  const url = `https://www.sec.gov/Archives/edgar/data/${Number(cikNum)}/${accNoDashes}/${primaryDocument}`;
  const res = await fetch(url, { headers: XML_HEADERS, next: { revalidate: 86400 } });
  if (!res.ok) return [];
  const xml = await res.text();
  if (!xml.includes("nonDerivativeTransaction") && !xml.includes("ownershipDocument")) return [];
  return parseForm4(xml, symbol, filingDate);
}

/**
 * FMP's free plan permanently 402s /insider-trading, so recent Form 4
 * filings are pulled and parsed directly from SEC EDGAR instead. Covers
 * open-market buys/sells, awards, and exercises for officers, directors,
 * and 10%+ owners — the same population FMP's endpoint reports on.
 */
export async function getEdgarInsiderTrades(symbol: string, limit = 20): Promise<InsiderTrade[]> {
  const cik = await getCik(symbol);
  const submissions = await getRecentFilings(cik);
  const recent = submissions.filings?.recent;
  if (!recent) return [];

  const form4Indexes: number[] = [];
  for (let i = 0; i < recent.form.length && form4Indexes.length < 15; i++) {
    if (recent.form[i] === "4" || recent.form[i] === "4/A") form4Indexes.push(i);
  }

  const results = await Promise.all(
    form4Indexes.map((i) =>
      fetchAndParseForm4(cik, recent.accessionNumber[i], recent.primaryDocument[i], recent.filingDate[i], symbol).catch(
        () => []
      )
    )
  );

  return results
    .flat()
    .sort((a, b) => (a.transactionDate < b.transactionDate ? 1 : -1))
    .slice(0, limit);
}
