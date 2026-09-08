"use client";

import Link from "next/link";
import { LineChart } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/i18n";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-panel/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold shrink-0">
            <LineChart size={22} className="text-accent" />
            <span>{t("appName")}</span>
          </Link>
          <div className="flex-1 max-w-xl">
            <SearchBar compact />
          </div>
          <nav className="hidden sm:flex items-center gap-4 text-sm text-muted shrink-0">
            <Link href="/" className="hover:text-accent">{t("watchlistNav")}</Link>
            <Link href="/compare" className="hover:text-accent">{t("compareNav")}</Link>
            <LanguageToggle />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      <footer className="mx-auto max-w-7xl px-4 py-8 text-xs text-muted">{t("footerNote")}</footer>
    </>
  );
}
