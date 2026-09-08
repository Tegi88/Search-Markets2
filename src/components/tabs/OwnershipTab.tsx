"use client";

import type { OwnershipSection } from "@/lib/types";
import { useSection } from "@/lib/useSection";
import { SectionError, SectionLoading } from "@/components/SectionState";
import { formatCompact, formatCurrency, formatDate } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

export default function OwnershipTab({ symbol, currency }: { symbol: string; currency: string }) {
  const { t } = useLanguage();
  const { data, loading, error } = useSection<OwnershipSection>(symbol, "ownership");

  if (loading) return <SectionLoading />;
  if (error) return <SectionError message={error} />;
  if (!data) return null;

  const holders = data.institutionalHolders.slice(0, 15);
  const insiders = data.insiderTrades.slice(0, 20);

  return (
    <div className="flex flex-col gap-4">
      <div className="card overflow-hidden">
        <div className="border-b p-4">
          <h3 className="font-medium">{t("topInstitutionalHolders")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("holder")}</th>
                <th>{t("shares")}</th>
                <th>{t("change")}</th>
                <th>{t("dateReported")}</th>
              </tr>
            </thead>
            <tbody>
              {holders.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-muted">{t("noInstitutionalData")}</td>
                </tr>
              )}
              {holders.map((h, i) => (
                <tr key={`${h.holder}-${i}`}>
                  <td className="max-w-[280px] truncate text-left">{h.holder}</td>
                  <td>{formatCompact(h.shares)}</td>
                  <td className={h.change >= 0 ? "text-up" : "text-down"}>
                    {h.change >= 0 ? "+" : ""}
                    {formatCompact(h.change)}
                  </td>
                  <td>{formatDate(h.dateReported)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b p-4">
          <h3 className="font-medium">{t("recentInsiderTransactions")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("insider")}</th>
                <th>{t("relationship")}</th>
                <th>{t("transaction")}</th>
                <th>{t("shares")}</th>
                <th>{t("price")}</th>
                <th>{t("sharesOwned")}</th>
                <th>{t("date")}</th>
              </tr>
            </thead>
            <tbody>
              {insiders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-muted">{t("noInsiderData")}</td>
                </tr>
              )}
              {insiders.map((trade, i) => (
                <tr key={`${trade.reportingName}-${i}`}>
                  <td className="max-w-[200px] truncate text-left">{trade.reportingName}</td>
                  <td className="max-w-[160px] truncate">{trade.typeOfOwner}</td>
                  <td>{trade.transactionType}</td>
                  <td>{formatCompact(trade.securitiesTransacted)}</td>
                  <td>{formatCurrency(trade.price, currency)}</td>
                  <td>{formatCompact(trade.securitiesOwned)}</td>
                  <td>{formatDate(trade.transactionDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
