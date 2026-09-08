"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import type { SearchResult } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  function go(symbol: string) {
    setOpen(false);
    setQuery("");
    router.push(`/stock/${symbol.toUpperCase()}`);
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="flex items-center gap-2 rounded-lg border bg-panel px-3 py-2">
        <Search size={16} className="text-muted shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              if (results[0]) go(results[0].symbol);
              else go(query.trim());
            }
          }}
          placeholder={t("searchPlaceholder")}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-muted hover:text-accent shrink-0">
            <X size={14} />
          </button>
        )}
      </div>
      {open && (loading || results.length > 0) && (
        <div className={`absolute left-0 right-0 mt-1 max-h-80 overflow-auto rounded-lg border bg-panel shadow-lg z-40 ${compact ? "" : ""}`}>
          {loading && <div className="px-3 py-2 text-xs text-muted">{t("searching")}</div>}
          {!loading &&
            results.map((r) => (
              <button
                key={`${r.symbol}-${r.exchangeShortName}`}
                onClick={() => go(r.symbol)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-bg"
              >
                <span>
                  <span className="font-medium">{r.symbol}</span>
                  <span className="ml-2 text-muted">{r.name}</span>
                </span>
                <span className="text-xs text-muted">{r.exchangeShortName}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
