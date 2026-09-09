"use client";

import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HistoricalPrice } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";
import DebugPanel from "@/components/DebugPanel";

const RANGES = ["1M", "6M", "1Y", "5Y", "MAX"] as const;

// Recharts' ResponsiveContainer relies on a ResizeObserver callback to learn
// its size, which in some Next.js app-router layouts never fires with a
// non-zero size on first mount — the chart then silently renders nothing.
// Measuring the wrapper element ourselves and passing explicit pixel
// dimensions to the chart sidesteps that entirely.
function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

const CHART_HEIGHT = 288;

export default function PriceChart({ symbol, currency = "USD" }: { symbol: string; currency?: string }) {
  const { t } = useLanguage();
  const [range, setRange] = useState<(typeof RANGES)[number]>("1Y");
  const [prices, setPrices] = useState<HistoricalPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState<Record<string, string> | undefined>(undefined);
  const { ref: chartWrapRef, width: chartWidth } = useElementWidth<HTMLDivElement>();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/chart/${symbol}?range=${range}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setPrices(d.prices ?? []);
          setDebug(d.debug);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [symbol, range]);

  const isUp =
    prices.length > 1 && prices[prices.length - 1].close >= prices[0].close;

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium">{t("priceHistory")}</h3>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-md px-2 py-1 text-xs ${
                r === range ? "bg-accent text-white" : "text-muted hover:bg-bg"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartWrapRef} className="h-72 w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">{t("loadingChart")}</div>
        ) : prices.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted">
            <span>{t("noPriceData")}</span>
            {debug && <DebugPanel debug={debug} />}
          </div>
        ) : chartWidth === 0 ? null : (
          <AreaChart
            width={chartWidth}
            height={CHART_HEIGHT}
            data={prices}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isUp ? "#16a34a" : "#dc2626"} stopOpacity={0.35} />
                <stop offset="95%" stopColor={isUp ? "#16a34a" : "#dc2626"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatDate(v)}
              minTickGap={40}
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              axisLine={false}
              tickLine={false}
              width={60}
              tickFormatter={(v) => formatCurrency(v, currency)}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value, currency), "Close"]}
              labelFormatter={(label) => formatDate(String(label))}
              contentStyle={{
                background: "var(--panel)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={isUp ? "#16a34a" : "#dc2626"}
              strokeWidth={2}
              fill="url(#priceFill)"
            />
          </AreaChart>
        )}
      </div>
    </div>
  );
}
