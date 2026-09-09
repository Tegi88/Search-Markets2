"use client";

import { useState } from "react";
import Link from "next/link";
import type { CoreStockData } from "@/lib/types";
import PriceChart from "@/components/PriceChart";
import DebugPanel from "@/components/DebugPanel";
import { formatCompact, formatPercent, formatRatio } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

export default function OverviewTab({ data }: { data: CoreStockData }) {
  const { t, lang } = useLanguage();
  const { profile, ratios, keyMetrics, peers } = data;
  const latestRatio = ratios[0];
  const latestMetrics = keyMetrics[0];

  const [translated, setTranslated] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState(false);

  async function handleTranslate() {
    if (!profile?.description) return;
    if (translated) {
      setTranslated(null);
      return;
    }
    setTranslating(true);
    setTranslateError(false);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: profile.description, target: "he" }),
      });
      const json = await res.json();
      if (!res.ok || !json.translated) throw new Error(json.error ?? "translate failed");
      setTranslated(json.translated);
    } catch {
      setTranslateError(true);
    } finally {
      setTranslating(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <DebugPanel debug={data.debug} />
        <PriceChart symbol={data.symbol} currency={profile?.currency} />
        {profile?.description && (
          <div className="card p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="font-medium">{t("about")} {profile.companyName}</h3>
              {lang === "he" && (
                <button
                  onClick={handleTranslate}
                  disabled={translating}
                  className="shrink-0 rounded-md border px-2.5 py-1 text-xs text-muted hover:border-accent hover:text-accent disabled:opacity-50"
                >
                  {translating ? t("translating") : translated ? t("showOriginal") : t("translateToHebrew")}
                </button>
              )}
            </div>
            <p className="text-sm leading-relaxed text-muted">{translated ?? profile.description}</p>
            {translateError && <p className="mt-2 text-xs text-down">{t("translateFailed")}</p>}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm text-accent hover:underline"
              >
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="card p-5">
          <h3 className="mb-3 font-medium">{t("keyStatistics")}</h3>
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-muted">{t("peRatio")}</dt>
            <dd className="text-right">{formatRatio(latestRatio?.priceEarningsRatio)}</dd>
            <dt className="text-muted">{t("pbRatio")}</dt>
            <dd className="text-right">{formatRatio(latestRatio?.priceToBookRatio)}</dd>
            <dt className="text-muted">{t("psRatio")}</dt>
            <dd className="text-right">{formatRatio(latestRatio?.priceToSalesRatio)}</dd>
            <dt className="text-muted">{t("evEbitda")}</dt>
            <dd className="text-right">{formatRatio(latestMetrics?.evToEbitda)}</dd>
            <dt className="text-muted">{t("roe")}</dt>
            <dd className="text-right">{formatPercent(latestRatio?.returnOnEquity)}</dd>
            <dt className="text-muted">{t("roa")}</dt>
            <dd className="text-right">{formatPercent(latestRatio?.returnOnAssets)}</dd>
            <dt className="text-muted">{t("grossMargin")}</dt>
            <dd className="text-right">{formatPercent(latestRatio?.grossProfitMargin)}</dd>
            <dt className="text-muted">{t("netMargin")}</dt>
            <dd className="text-right">{formatPercent(latestRatio?.netProfitMargin)}</dd>
            <dt className="text-muted">{t("debtEquity")}</dt>
            <dd className="text-right">{formatRatio(latestRatio?.debtEquityRatio)}</dd>
            <dt className="text-muted">{t("dividendYield")}</dt>
            <dd className="text-right">{formatPercent(latestRatio?.dividendYield)}</dd>
            <dt className="text-muted">{t("enterpriseValue")}</dt>
            <dd className="text-right">{formatCompact(latestMetrics?.enterpriseValue)}</dd>
          </dl>
        </div>

        {peers.length > 0 && (
          <div className="card p-5">
            <h3 className="mb-3 font-medium">{t("peerCompanies")}</h3>
            <div className="flex flex-wrap gap-2">
              {peers.slice(0, 10).map((p) => (
                <Link
                  key={p}
                  href={`/stock/${p}`}
                  className="rounded-full border px-2.5 py-1 text-xs hover:border-accent hover:text-accent"
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
