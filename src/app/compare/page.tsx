"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import type { Quote } from "@/lib/types";
import { formatCompact, formatCurrency } from "@/lib/format";

export default function ComparePage() {
  const [symbols, setSymbols] = useState<string[]>(["AAPL", "MSFT", "GOOGL"]);
  const [input, setInput] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadQuotes(list: string[]) {
    if (list.length === 0) {
      setQuotes([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/quotes?symbols=${list.join(",")}`);
      const data = await res.json();
      setQuotes(data.quotes ?? []);
    } finally {
      setLoading(false);
    }
  }

  function addSymbol() {
    const sym = input.trim().toUpperCase();
    if (!sym || symbols.includes(sym)) return;
    const next = [...symbols, sym];
    setSymbols(next);
    setInput("");
    loadQuotes(next);
  }

  function removeSymbol(sym: string) {
    const next = symbols.filter((s) => s !== sym);
    setSymbols(next);
    loadQuotes(next);
  }

  useEffect(() => {
    loadQuotes(symbols);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Compare Stocks</h1>
      <div className="flex flex-wrap items-center gap-2">
        {symbols.map((s) => (
          <span key={s} className="flex items-center gap-1 rounded-full border bg-panel px-3 py-1 text-sm">
            {s}
            <button onClick={() => removeSymbol(s)} className="text-muted hover:text-down">
              <X size={12} />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-1 rounded-full border bg-panel px-2 py-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSymbol()}
            placeholder="Add ticker"
            className="w-24 bg-transparent text-sm outline-none"
          />
          <button onClick={addSymbol} className="text-muted hover:text-accent">
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Price</th>
                <th>Change %</th>
                <th>Market Cap</th>
                <th>P/E</th>
                <th>EPS</th>
                <th>52W High</th>
                <th>52W Low</th>
                <th>Avg Volume</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={10} className="text-muted">Loading…</td>
                </tr>
              )}
              {!loading && quotes.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-muted">Add tickers above to compare.</td>
                </tr>
              )}
              {!loading &&
                quotes.map((q) => (
                  <tr key={q.symbol}>
                    <td>
                      <Link href={`/stock/${q.symbol}`} className="font-medium text-accent hover:underline">
                        {q.symbol}
                      </Link>
                    </td>
                    <td className="max-w-[200px] truncate text-left">{q.name}</td>
                    <td>{formatCurrency(q.price)}</td>
                    <td className={q.changesPercentage >= 0 ? "text-up" : "text-down"}>
                      {q.changesPercentage?.toFixed(2)}%
                    </td>
                    <td>{formatCompact(q.marketCap)}</td>
                    <td>{q.pe ? q.pe.toFixed(2) : "—"}</td>
                    <td>{q.eps ? q.eps.toFixed(2) : "—"}</td>
                    <td>{formatCurrency(q.yearHigh)}</td>
                    <td>{formatCurrency(q.yearLow)}</td>
                    <td>{formatCompact(q.avgVolume)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
