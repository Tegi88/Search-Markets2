"use client";

import Image from "next/image";
import type { CompanyProfile, CompanyRating, Quote } from "@/lib/types";
import {
  classForChange,
  formatCompact,
  formatCurrency,
  formatDate,
  formatPercent,
  signPrefix,
} from "@/lib/format";
import { useLanguage } from "@/lib/i18n";
import WatchlistStarButton from "./WatchlistStarButton";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default function StockHeader({
  profile,
  quote,
  rating,
}: {
  profile: CompanyProfile;
  quote: Quote | null;
  rating: CompanyRating | null;
}) {
  const { t } = useLanguage();
  const currency = profile.currency || "USD";
  const price = quote?.price ?? profile.price;
  const change = quote?.change ?? profile.changes;
  const changePct = quote?.changesPercentage ?? profile.changesPercentage;

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {profile.image && (
            <Image
              src={profile.image}
              alt={profile.symbol}
              width={48}
              height={48}
              className="rounded-lg border bg-white object-contain p-1"
              unoptimized
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{profile.companyName}</h1>
              <span className="rounded bg-bg px-1.5 py-0.5 text-xs text-muted">{profile.symbol}</span>
            </div>
            <p className="text-sm text-muted">
              {profile.exchangeShortName} · {profile.sector} · {profile.industry}
            </p>
          </div>
        </div>
        <WatchlistStarButton symbol={profile.symbol} />
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div className="text-3xl font-semibold">{formatCurrency(price, currency)}</div>
        <div className={`text-sm font-medium ${classForChange(change)}`}>
          {signPrefix(change)}
          {formatCurrency(change, currency)} ({signPrefix(changePct)}
          {formatPercent(changePct, true)})
        </div>
        {rating && (
          <span className="rounded-full border px-2.5 py-1 text-xs">
            {t("rating")}: <span className="font-semibold">{rating.rating}</span> — {rating.ratingRecommendation}
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-3 md:grid-cols-6">
        <Stat label={t("open")} value={formatCurrency(quote?.open, currency)} />
        <Stat label={t("prevClose")} value={formatCurrency(quote?.previousClose, currency)} />
        <Stat
          label={t("dayRange")}
          value={quote ? `${formatCurrency(quote.dayLow, currency)} – ${formatCurrency(quote.dayHigh, currency)}` : "—"}
        />
        <Stat
          label={t("yearRange")}
          value={quote ? `${formatCurrency(quote.yearLow, currency)} – ${formatCurrency(quote.yearHigh, currency)}` : "—"}
        />
        <Stat label={t("volume")} value={formatCompact(quote?.volume)} />
        <Stat label={t("avgVolume")} value={formatCompact(quote?.avgVolume)} />
        <Stat label={t("marketCap")} value={formatCompact(quote?.marketCap ?? profile.mktCap)} />
        <Stat label={t("peRatioTTM")} value={quote?.pe ? quote.pe.toFixed(2) : "—"} />
        <Stat label={t("epsTTM")} value={quote?.eps ? quote.eps.toFixed(2) : "—"} />
        <Stat label={t("beta")} value={profile.beta ? profile.beta.toFixed(2) : "—"} />
        <Stat label={t("employees")} value={profile.fullTimeEmployees || "—"} />
        <Stat label={t("ipoDate")} value={formatDate(profile.ipoDate)} />
      </div>
    </div>
  );
}
