"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FullStockData, Quote } from "@/lib/types";
import FinancialTable from "@/components/FinancialTable";
import { keyMetricsRows, ratioRows } from "@/lib/tableRows";
import { formatCompact, formatCurrency } from "@/lib/format";

function PeerComparison({ symbol, peers }: { symbol: string; peers: string[] }) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const all = [symbol, ...peers.slice(0, 6)];
    setLoading(true);
    fetch(`/api/quotes?symbols=${all.join(",")}`)
      .then((r) => r.json())
      .then((d) => setQuotes(d.quotes ?? []))
      .finally(() => setLoading(false));
  }, [symbol, peers]);

  if (peers.length === 0) return null;

  return (
    <div className="card overflow-hidden">
      <div className="border-b p-4">
        <h3 className="font-medium">Peer Comparison</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Price</th>
              <th>Market Cap</th>
              <th>P/E</th>
              <th>EPS</th>
              <th>52W High</th>
              <th>52W Low</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="text-muted">Loading…</td>
              </tr>
            )}
            {!loading &&
              quotes.map((q) => (
                <tr key={q.symbol} className={q.symbol === symbol ? "font-semibold" : ""}>
                  <td>
                    <Link href={`/stock/${q.symbol}`} className="text-accent hover:underline">
                      {q.symbol}
                    </Link>
                  </td>
                  <td>{formatCurrency(q.price)}</td>
                  <td>{formatCompact(q.marketCap)}</td>
                  <td>{q.pe ? q.pe.toFixed(2) : "—"}</td>
                  <td>{q.eps ? q.eps.toFixed(2) : "—"}</td>
                  <td>{formatCurrency(q.yearHigh)}</td>
                  <td>{formatCurrency(q.yearLow)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ValuationTab({ data }: { data: FullStockData }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <div className="border-b p-4">
          <h3 className="font-medium">Valuation & Profitability Ratios</h3>
        </div>
        <FinancialTable rows={ratioRows} data={data.ratios} />
      </div>
      <div className="card">
        <div className="border-b p-4">
          <h3 className="font-medium">Key Metrics</h3>
        </div>
        <FinancialTable rows={keyMetricsRows} data={data.keyMetrics} />
      </div>
      <PeerComparison symbol={data.symbol} peers={data.peers} />
    </div>
  );
}
