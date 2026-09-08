"use client";

import { formatDate } from "@/lib/format";
import { useLanguage, type TranslationKey } from "@/lib/i18n";

export interface TableRowConfig<T> {
  labelKey: TranslationKey;
  key: keyof T;
  format: (value: number) => string;
  bold?: boolean;
}

export default function FinancialTable<T extends { date: string }>({
  rows,
  data,
}: {
  rows: TableRowConfig<T>[];
  data: T[];
}) {
  const { t } = useLanguage();

  if (data.length === 0) {
    return <div className="p-6 text-sm text-muted">{t("noDataAvailable")}</div>;
  }
  const ordered = [...data].reverse();

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>{t("metric")}</th>
            {ordered.map((d) => (
              <th key={d.date}>{formatDate(d.date)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row.key)} className={row.bold ? "font-semibold" : ""}>
              <td>{t(row.labelKey)}</td>
              {ordered.map((d) => {
                const raw = d[row.key];
                const num = typeof raw === "number" ? raw : NaN;
                return <td key={d.date}>{Number.isNaN(num) ? "—" : row.format(num)}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
