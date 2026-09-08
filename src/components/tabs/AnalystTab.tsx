"use client";

import type { AnalystSection, CompanyRating } from "@/lib/types";
import { useSection } from "@/lib/useSection";
import { SectionError, SectionLoading } from "@/components/SectionState";
import { formatCompact, formatCurrency, formatDate } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

export default function AnalystTab({
  symbol,
  currency,
  price,
  rating,
}: {
  symbol: string;
  currency: string;
  price?: number;
  rating: CompanyRating | null;
}) {
  const { t } = useLanguage();
  const { data, loading, error } = useSection<AnalystSection>(symbol, "analyst");

  if (loading) return <SectionLoading />;
  if (error) return <SectionError message={error} />;
  if (!data) return null;

  const { priceTarget, estimates, upgradesDowngrades } = data;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 font-medium">{t("priceTarget")}</h3>
          {priceTarget ? (
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted">{t("currentPrice")}</dt>
              <dd className="text-right">{formatCurrency(price, currency)}</dd>
              <dt className="text-muted">{t("avgTargetQuarter")}</dt>
              <dd className="text-right">{formatCurrency(priceTarget.lastQuarterAvgPriceTarget, currency)}</dd>
              <dt className="text-muted">{t("avgTargetYear")}</dt>
              <dd className="text-right">{formatCurrency(priceTarget.lastYearAvgPriceTarget, currency)}</dd>
              <dt className="text-muted">{t("analystsLastQuarter")}</dt>
              <dd className="text-right">{priceTarget.lastQuarterCount ?? "—"}</dd>
            </dl>
          ) : (
            <p className="text-sm text-muted">{t("noPriceTargetData")}</p>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-3 font-medium">{t("analystRating")}</h3>
          {rating ? (
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted">{t("overallRating")}</dt>
              <dd className="text-right font-semibold">{rating.rating}</dd>
              <dt className="text-muted">{t("recommendation")}</dt>
              <dd className="text-right">{rating.ratingRecommendation}</dd>
              <dt className="text-muted">{t("score")}</dt>
              <dd className="text-right">{rating.ratingScore}/5</dd>
              <dt className="text-muted">{t("asOf")}</dt>
              <dd className="text-right">{formatDate(rating.date)}</dd>
            </dl>
          ) : (
            <p className="text-sm text-muted">{t("noRatingData")}</p>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b p-4">
          <h3 className="font-medium">{t("analystEstimates")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("period")}</th>
                <th>{t("estRevenueLow")}</th>
                <th>{t("estRevenueAvg")}</th>
                <th>{t("estRevenueHigh")}</th>
                <th>{t("estEpsLow")}</th>
                <th>{t("estEpsAvg")}</th>
                <th>{t("estEpsHigh")}</th>
                <th>{t("numAnalysts")}</th>
              </tr>
            </thead>
            <tbody>
              {estimates.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-muted">{t("noEstimateData")}</td>
                </tr>
              )}
              {estimates.map((e) => (
                <tr key={e.date}>
                  <td className="text-left">{formatDate(e.date)}</td>
                  <td>{formatCompact(e.estimatedRevenueLow)}</td>
                  <td>{formatCompact(e.estimatedRevenueAvg)}</td>
                  <td>{formatCompact(e.estimatedRevenueHigh)}</td>
                  <td>{e.estimatedEpsLow?.toFixed(2) ?? "—"}</td>
                  <td>{e.estimatedEpsAvg?.toFixed(2) ?? "—"}</td>
                  <td>{e.estimatedEpsHigh?.toFixed(2) ?? "—"}</td>
                  <td>{e.numberAnalystsEstimatedEps ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b p-4">
          <h3 className="font-medium">{t("upgradesDowngrades")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("firm")}</th>
                <th>{t("action")}</th>
                <th>{t("newGrade")}</th>
                <th>{t("previousGrade")}</th>
                <th>{t("date")}</th>
              </tr>
            </thead>
            <tbody>
              {upgradesDowngrades.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted">{t("noAnalystActions")}</td>
                </tr>
              )}
              {upgradesDowngrades.slice(0, 15).map((u, i) => (
                <tr key={`${u.gradingCompany}-${i}`}>
                  <td className="max-w-[200px] truncate text-left">{u.gradingCompany}</td>
                  <td>{u.action}</td>
                  <td>{u.newGrade}</td>
                  <td>{u.previousGrade ?? "—"}</td>
                  <td>{formatDate(u.publishedDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
