"use client";

import { useState } from "react";
import type { FinancialsSection } from "@/lib/types";
import { useSection } from "@/lib/useSection";
import FinancialTable from "@/components/FinancialTable";
import { SectionError, SectionLoading } from "@/components/SectionState";
import { balanceRows, cashFlowRows, incomeRows } from "@/lib/tableRows";
import { useLanguage, type TranslationKey } from "@/lib/i18n";

const STATEMENTS: { id: "income" | "balance" | "cashflow"; labelKey: TranslationKey }[] = [
  { id: "income", labelKey: "incomeStatement" },
  { id: "balance", labelKey: "balanceSheet" },
  { id: "cashflow", labelKey: "cashFlow" },
];

export default function FinancialsTab({ symbol }: { symbol: string }) {
  const { t } = useLanguage();
  const [statement, setStatement] = useState<(typeof STATEMENTS)[number]["id"]>("income");
  const { data, loading, error } = useSection<FinancialsSection>(symbol, "financials");

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div className="flex gap-1">
          {STATEMENTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setStatement(s.id)}
              className={`rounded-md px-3 py-1.5 text-sm ${
                statement === s.id ? "bg-accent text-white" : "text-muted hover:bg-bg"
              }`}
            >
              {t(s.labelKey)}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted">{t("annualCurrency")}</span>
      </div>
      {loading && <SectionLoading />}
      {error && <SectionError message={error} />}
      {data && statement === "income" && <FinancialTable rows={incomeRows} data={data.income} />}
      {data && statement === "balance" && <FinancialTable rows={balanceRows} data={data.balance} />}
      {data && statement === "cashflow" && <FinancialTable rows={cashFlowRows} data={data.cashflow} />}
    </div>
  );
}
