import type { FullStockData } from "@/lib/types";
import { formatCompact, formatCurrency, formatDate } from "@/lib/format";

export default function OwnershipTab({ data }: { data: FullStockData }) {
  const holders = data.institutionalHolders.slice(0, 15);
  const insiders = data.insiderTrades.slice(0, 20);
  const currency = data.profile?.currency ?? "USD";

  return (
    <div className="flex flex-col gap-4">
      <div className="card overflow-hidden">
        <div className="border-b p-4">
          <h3 className="font-medium">Top Institutional Holders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Holder</th>
                <th>Shares</th>
                <th>Change</th>
                <th>Date Reported</th>
              </tr>
            </thead>
            <tbody>
              {holders.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-muted">No institutional ownership data available.</td>
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
          <h3 className="font-medium">Recent Insider Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Insider</th>
                <th>Relationship</th>
                <th>Transaction</th>
                <th>Shares</th>
                <th>Price</th>
                <th>Shares Owned</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {insiders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-muted">No insider transaction data available.</td>
                </tr>
              )}
              {insiders.map((t, i) => (
                <tr key={`${t.reportingName}-${i}`}>
                  <td className="max-w-[200px] truncate text-left">{t.reportingName}</td>
                  <td className="max-w-[160px] truncate">{t.typeOfOwner}</td>
                  <td>{t.transactionType}</td>
                  <td>{formatCompact(t.securitiesTransacted)}</td>
                  <td>{formatCurrency(t.price, currency)}</td>
                  <td>{formatCompact(t.securitiesOwned)}</td>
                  <td>{formatDate(t.transactionDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
