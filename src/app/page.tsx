"use client";

import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import WatchlistTable from "@/components/WatchlistTable";
import { useLanguage } from "@/lib/i18n";

const POPULAR = [
  "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "BRK-B",
  "JPM", "AVGO", "LLY", "V", "UNH", "XOM", "WMT", "MA",
];

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-4 py-10 text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">{t("heroTitle")}</h1>
        <p className="max-w-xl text-muted">{t("heroSubtitle")}</p>
        <div className="w-full max-w-xl">
          <SearchBar />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted">{t("popularStocks")}</h2>
        <div className="flex flex-wrap gap-2">
          {POPULAR.map((s) => (
            <Link
              key={s}
              href={`/stock/${s}`}
              className="rounded-full border bg-panel px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
            >
              {s}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <WatchlistTable />
      </section>
    </div>
  );
}
