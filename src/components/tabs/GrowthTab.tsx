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
import type { FullStockData } from "@/lib/types";
import FinancialTable from "@/components/FinancialTable";
import { growthRows } from "@/lib/tableRows";
import { formatDate, formatPercent } from "@/lib/format";

export default function GrowthTab({ data }: { data: FullStockData }) {
  const chartData = [...data.growth]
    .reverse()
    .map((g) => ({
      period: formatDate(g.date),
      Revenue: Math.round(g.revenueGrowth * 1000) / 10,
      "Net Income": Math.round(g.netIncomeGrowth * 1000) / 10,
    }));

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4">
        <h3 className="mb-3 font-medium">Revenue & Net Income Growth (YoY %)</h3>
        <div className="h-72 w-full">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted">No growth data available.</div>
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
                <Bar dataKey="Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Net Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="card">
        <div className="border-b p-4">
          <h3 className="font-medium">Growth Rates</h3>
        </div>
        <FinancialTable rows={growthRows} data={data.growth} />
      </div>
      <div className="card p-4 text-xs text-muted">
        Latest revenue growth: {formatPercent(data.growth[0]?.revenueGrowth)} · Latest EPS growth:{" "}
        {formatPercent(data.growth[0]?.epsgrowth)}
      </div>
    </div>
  );
}
