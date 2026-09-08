import { formatDate } from "@/lib/format";

export interface TableRowConfig<T> {
  label: string;
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
  if (data.length === 0) {
    return <div className="p-6 text-sm text-muted">No data available.</div>;
  }
  const ordered = [...data].reverse();

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Metric</th>
            {ordered.map((d) => (
              <th key={d.date}>{formatDate(d.date)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row.key)} className={row.bold ? "font-semibold" : ""}>
              <td>{row.label}</td>
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
