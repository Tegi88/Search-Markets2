"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "search-markets:watchlist";
const DEFAULT_WATCHLIST = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN"];

function readStorage(): string[] {
  if (typeof window === "undefined") return DEFAULT_WATCHLIST;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WATCHLIST;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_WATCHLIST;
  } catch {
    return DEFAULT_WATCHLIST;
  }
}

export function useWatchlist() {
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_WATCHLIST);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSymbols(readStorage());
    setReady(true);
  }, []);

  const persist = useCallback((next: string[]) => {
    setSymbols(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable, ignore
    }
  }, []);

  const add = useCallback(
    (symbol: string) => {
      const sym = symbol.toUpperCase();
      persist(Array.from(new Set([...readStorage(), sym])));
    },
    [persist]
  );

  const remove = useCallback(
    (symbol: string) => {
      const sym = symbol.toUpperCase();
      persist(readStorage().filter((s) => s !== sym));
    },
    [persist]
  );

  const toggle = useCallback(
    (symbol: string) => {
      const sym = symbol.toUpperCase();
      const current = readStorage();
      if (current.includes(sym)) {
        persist(current.filter((s) => s !== sym));
      } else {
        persist([...current, sym]);
      }
    },
    [persist]
  );

  const has = useCallback((symbol: string) => symbols.includes(symbol.toUpperCase()), [symbols]);

  return { symbols, ready, add, remove, toggle, has };
}
