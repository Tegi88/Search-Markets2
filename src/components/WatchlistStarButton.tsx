"use client";

import { Star } from "lucide-react";
import { useWatchlist } from "@/lib/useWatchlist";

export default function WatchlistStarButton({ symbol }: { symbol: string }) {
  const { has, toggle, ready } = useWatchlist();
  const active = ready && has(symbol);

  return (
    <button
      onClick={() => toggle(symbol)}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm ${
        active ? "border-accent text-accent" : "text-muted hover:text-accent"
      }`}
    >
      <Star size={14} fill={active ? "currentColor" : "none"} />
      {active ? "In Watchlist" : "Add to Watchlist"}
    </button>
  );
}
