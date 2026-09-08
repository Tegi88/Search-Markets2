import type { FullStockData } from "@/lib/types";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";

export default function DividendsTab({ data }: { data: FullStockData }) {
  const latestRatio = data.ratios[0];
  const dividends = data.dividends.slice(0, 20);
  const currency = data.profile?.currency ?? "USD";

  if (dividends.length === 0) {
    return (
      <div className="card p-6 text-sm text-muted">
        {data.profile?.companyName ?? data.symbol} does not appear to pay a dividend, or no dividend history is
        available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4">
          <div className="text-xs text-muted">Dividend Yield</div>
          <div className="text-lg font-semibold">{formatPercent(latestRatio?.dividendYield)}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted">Payout Ratio</div>
          <div className="text-lg font-semibold">{formatPercent(latestRatio?.payoutRatio)}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted">Latest Dividend</div>
          <div className="text-lg font-semibold">{formatCurrency(dividends[0]?.dividend, currency)}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted">Last Payment</div>
          <div className="text-lg font-semibold">{formatDate(dividends[0]?.date)}</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b p-4">
          <h3 className="font-medium">Dividend History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ex-Dividend Date</th>
                <th>Payment Date</th>
                <th>Amount</th>
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
