import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { LineChart } from "lucide-react";
import SearchBar from "@/components/SearchBar";

export const metadata: Metadata = {
  title: "Search Markets — Stock Research",
  description: "Deep fundamental research on any public company: financials, valuation, growth, ownership, and analyst estimates.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased text-slate-900 dark:text-slate-100">
        <header className="sticky top-0 z-30 border-b bg-panel/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold shrink-0">
              <LineChart size={22} className="text-accent" />
              <span>Search Markets</span>
            </Link>
            <div className="flex-1 max-w-xl">
              <SearchBar compact />
            </div>
            <nav className="hidden sm:flex items-center gap-4 text-sm text-muted shrink-0">
              <Link href="/" className="hover:text-accent">Watchlist</Link>
              <Link href="/compare" className="hover:text-accent">Compare</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-7xl px-4 py-8 text-xs text-muted">
          Data provided by Financial Modeling Prep. For research and educational purposes only — not investment advice.
        </footer>
      </body>
    </html>
  );
}
