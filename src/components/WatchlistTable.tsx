"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Trash2 } from "lucide-react";
import { useWatchlist } from "@/lib/useWatchlist";
import type { Quote } from "@/lib/types";
import { classForChange, formatCompact, formatCurrency, formatPercent, signPrefix } from "@/lib/format";

export default function WatchlistTable() {
  const { symbols, ready, remove } = useWatchlist();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (symbols.length === 0) {
      setQuotes([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/quotes?symbols=${symbols.join(",")}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setQuotes(d.quotes ?? []);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [symbols, ready]);

  if (ready && symbols.length === 0) {
    return (
      <div className="card p-6 text-sm text-muted">
        Your watchlist is empty. Search for a stock above and add it to your watchlist.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Star size={16} className="text-accent" />
        <h2 className="font-medium">Watchlist</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Price</th>
              <th>Change</th>
              <th>Market Cap</th>
              <th>P/E</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              symbols.map((s) => (
                <tr key={s}>
                  <td colSpan={7} className="text-muted">Loading {s}…</td>
                </tr>
              ))}
            {!loading &&
              symbols.map((s) => {
                const q = quotes.find((x) => x.symbol === s);
                return (
                  <tr key={s}>
                    <td>
                      <Link href={`/stock/${s}`} className="font-medium text-accent hover:underline">
                        {s}
                      </Link>
                    </td>
                    <td className="max-w-[220px] truncate text-left">{q?.name ?? "—"}</td>
                    <td>{q ? formatCurrency(q.price) : "—"}</td>
                    <td className={classForChange(q?.changesPercentage)}>
                      {q ? `${signPrefix(q.changesPercentage)}${formatPercent(q.changesPercentage, true)}` : "—"}
                    </td>
                    <td>{q ? formatCompact(q.marketCap) : "—"}</td>
                    <td>{q?.pe ? q.pe.toFixed(2) : "—"}</td>
                    <td>
                      <button
                        onClick={() => remove(s)}
                        className="text-muted hover:text-down"
                        aria-label={`Remove ${s}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
