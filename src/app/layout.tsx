import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Search Markets — Stock Research",
  description: "Deep fundamental research on any public company: financials, valuation, growth, ownership, and analyst estimates.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased text-slate-900 dark:text-slate-100">
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
