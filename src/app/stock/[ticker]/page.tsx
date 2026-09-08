"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { FullStockData } from "@/lib/types";
import StockHeader from "@/components/StockHeader";
import Tabs, { TabDef } from "@/components/Tabs";
import OverviewTab from "@/components/tabs/OverviewTab";
import FinancialsTab from "@/components/tabs/FinancialsTab";
import ValuationTab from "@/components/tabs/ValuationTab";
import GrowthTab from "@/components/tabs/GrowthTab";
import DividendsTab from "@/components/tabs/DividendsTab";
import OwnershipTab from "@/components/tabs/OwnershipTab";
import AnalystTab from "@/components/tabs/AnalystTab";
import NewsTab from "@/components/tabs/NewsTab";
import { useLanguage } from "@/lib/i18n";

export default function StockPage() {
  const { t } = useLanguage();
  const TABS: TabDef[] = [
    { id: "overview", label: t("tabOverview") },
    { id: "financials", label: t("tabFinancials") },
    { id: "valuation", label: t("tabValuation") },
    { id: "growth", label: t("tabGrowth") },
    { id: "dividends", label: t("tabDividends") },
    { id: "ownership", label: t("tabOwnership") },
    { id: "analyst", label: t("tabAnalyst") },
    { id: "news", label: t("tabNews") },
  ];
  const params = useParams<{ ticker: string }>();
  const ticker = (params?.ticker ?? "").toString().toUpperCase();
  const [data, setData] = useState<FullStockData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (!ticker) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    setTab("overview");
    fetch(`/api/stock/${ticker}`)
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? "Failed to load data");
        return json as FullStockData;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load data");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted">
        <Loader2 className="animate-spin" />
        <span>{t("loading")} {ticker}…</span>
      </div>
    );
  }

  if (error || !data?.profile) {
    const isKeyError = error?.startsWith("MISSING_API_KEY");
    return (
      <div className="card mx-auto mt-8 flex max-w-lg flex-col items-center gap-3 p-8 text-center">
        <AlertTriangle className="text-down" size={28} />
        <h2 className="font-medium">{t("couldntLoad")} {ticker}</h2>
        <p className="text-sm text-muted">{error ?? t("noDataReturned")}</p>
        {isKeyError && (
          <p className="text-sm text-muted">
            {t("addApiKeyNote1")} <code className="rounded bg-bg px-1">.env.local</code> {t("addApiKeyNote2")}{" "}
            <code className="rounded bg-bg px-1">FMP_API_KEY</code>. {t("getOneAt")}{" "}
            <a
              className="text-accent hover:underline"
              href="https://site.financialmodelingprep.com/developer/docs/pricing"
              target="_blank"
              rel="noreferrer"
            >
              financialmodelingprep.com
            </a>
            .
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <StockHeader profile={data.profile} quote={data.quote} rating={data.rating} />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <div>
        {tab === "overview" && <OverviewTab data={data} />}
        {tab === "financials" && <FinancialsTab data={data} />}
        {tab === "valuation" && <ValuationTab data={data} />}
        {tab === "growth" && <GrowthTab data={data} />}
        {tab === "dividends" && <DividendsTab data={data} />}
        {tab === "ownership" && <OwnershipTab data={data} />}
        {tab === "analyst" && <AnalystTab data={data} />}
        {tab === "news" && <NewsTab data={data} />}
      </div>
    </div>
  );
}
