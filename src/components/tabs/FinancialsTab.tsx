"use client";

import { useState } from "react";
import type { FullStockData } from "@/lib/types";
import FinancialTable from "@/components/FinancialTable";
import { balanceRows, cashFlowRows, incomeRows } from "@/lib/tableRows";

const STATEMENTS = [
  { id: "income", label: "Income Statement" },
  { id: "balance", label: "Balance Sheet" },
  { id: "cashflow", label: "Cash Flow" },
] as const;

export default function FinancialsTab({ data }: { data: FullStockData }) {
  const [statement, setStatement] = useState<(typeof STATEMENTS)[number]["id"]>("income");

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
              {s.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted">Annual, in reporting currency</span>
      </div>
      {statement === "income" && <FinancialTable rows={incomeRows} data={data.income} />}
      {statement === "balance" && <FinancialTable rows={balanceRows} data={data.balance} />}
      {statement === "cashflow" && <FinancialTable rows={cashFlowRows} data={data.cashflow} />}
    </div>
  );
}
