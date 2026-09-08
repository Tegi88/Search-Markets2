"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { GrowthSection } from "@/lib/types";
import { useSection } from "@/lib/useSection";
import FinancialTable from "@/components/FinancialTable";
import { SectionError, SectionLoading } from "@/components/SectionState";
import { growthRows } from "@/lib/tableRows";
import { formatDate, formatPercent } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

export default function GrowthTab({ symbol }: { symbol: string }) {
  const { t } = useLanguage();
  const { data, loading, error } = useSection<GrowthSection>(symbol, "growth");

  if (loading) return <SectionLoading />;
  if (error) return <SectionError message={error} />;
  if (!data) return null;

  const revenueLabel = t("revenue");
  const netIncomeLabel = t("netIncome");
  const chartData = [...data.growth]
    .reverse()
    .map((g) => ({
      period: formatDate(g.date),
      [revenueLabel]: Math.round(g.revenueGrowth * 1000) / 10,
      [netIncomeLabel]: Math.round(g.netIncomeGrowth * 1000) / 10,
    }));

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4">
        <h3 className="mb-3 font-medium">{t("revenueNetIncomeGrowth")}</h3>
        <div className="h-72 w-full">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted">{t("noGrowthData")}</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  formatter={(v: number) => `${v}%`}
                  contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey={revenueLabel} fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey={netIncomeLabel} fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="card">
        <div className="border-b p-4">
          <h3 className="font-medium">{t("growthRates")}</h3>
        </div>
        <FinancialTable rows={growthRows} data={data.growth} />
      </div>
      <div className="card p-4 text-xs text-muted">
        {t("latestRevenueGrowth")}: {formatPercent(data.growth[0]?.revenueGrowth)} · {t("latestEpsGrowth")}:{" "}
        {formatPercent(data.growth[0]?.epsgrowth)}
      </div>
    </div>
  );
}
