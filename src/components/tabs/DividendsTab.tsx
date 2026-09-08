"use client";

import type { DividendsSection, Ratio } from "@/lib/types";
import { useSection } from "@/lib/useSection";
import { SectionError, SectionLoading } from "@/components/SectionState";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

export default function DividendsTab({
  symbol,
  companyName,
  currency,
  latestRatio,
}: {
  symbol: string;
  companyName: string;
  currency: string;
  latestRatio?: Ratio;
}) {
  const { t } = useLanguage();
  const { data, loading, error } = useSection<DividendsSection>(symbol, "dividends");

  if (loading) return <SectionLoading />;
  if (error) return <SectionError message={error} />;
  if (!data) return null;

  const dividends = data.dividends.slice(0, 20);

  if (dividends.length === 0) {
    return (
      <div className="card p-6 text-sm text-muted">
        {companyName || symbol} {t("noDividend")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4">
          <div className="text-xs text-muted">{t("dividendYield")}</div>
          <div className="text-lg font-semibold">{formatPercent(latestRatio?.dividendYield)}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted">{t("payoutRatio")}</div>
          <div className="text-lg font-semibold">{formatPercent(latestRatio?.payoutRatio)}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted">{t("latestDividend")}</div>
          <div className="text-lg font-semibold">{formatCurrency(dividends[0]?.dividend, currency)}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted">{t("lastPayment")}</div>
          <div className="text-lg font-semibold">{formatDate(dividends[0]?.date)}</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b p-4">
          <h3 className="font-medium">{t("dividendHistory")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("exDividendDate")}</th>
                <th>{t("paymentDate")}</th>
                <th>{t("amount")}</th>
              </tr>
            </thead>
            <tbody>
              {dividends.map((d) => (
                <tr key={d.date}>
                  <td className="text-left">{formatDate(d.date)}</td>
                  <td>{formatDate(d.paymentDate)}</td>
                  <td>{formatCurrency(d.dividend, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
