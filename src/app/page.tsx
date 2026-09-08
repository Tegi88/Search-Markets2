import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import WatchlistTable from "@/components/WatchlistTable";

const POPULAR = [
  "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "BRK-B",
  "JPM", "AVGO", "LLY", "V", "UNH", "XOM", "WMT", "MA",
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-4 py-10 text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">Research any stock in seconds</h1>
        <p className="max-w-xl text-muted">
          Financial statements, valuation ratios, growth trends, dividends, ownership, insider trades, and analyst
          estimates — all in one place.
        </p>
        <div className="w-full max-w-xl">
          <SearchBar />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted">Popular stocks</h2>
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
