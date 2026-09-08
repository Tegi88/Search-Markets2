import type { FullStockData } from "@/lib/types";
import { formatCompact, formatCurrency, formatDate } from "@/lib/format";

export default function AnalystTab({ data }: { data: FullStockData }) {
  const { priceTarget, estimates, upgradesDowngrades, rating, quote, profile } = data;
  const currency = profile?.currency ?? "USD";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 font-medium">Price Target</h3>
          {priceTarget ? (
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted">Current Price</dt>
              <dd className="text-right">{formatCurrency(quote?.price, currency)}</dd>
              <dt className="text-muted">Avg Target (Last Quarter)</dt>
              <dd className="text-right">{formatCurrency(priceTarget.lastQuarterAvgPriceTarget, currency)}</dd>
              <dt className="text-muted">Avg Target (Last Year)</dt>
              <dd className="text-right">{formatCurrency(priceTarget.lastYearAvgPriceTarget, currency)}</dd>
              <dt className="text-muted">Analysts (Last Quarter)</dt>
              <dd className="text-right">{priceTarget.lastQuarterCount ?? "—"}</dd>
            </dl>
          ) : (
            <p className="text-sm text-muted">No analyst price target data available.</p>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-3 font-medium">Analyst Rating</h3>
          {rating ? (
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted">Overall Rating</dt>
              <dd className="text-right font-semibold">{rating.rating}</dd>
              <dt className="text-muted">Recommendation</dt>
              <dd className="text-right">{rating.ratingRecommendation}</dd>
              <dt className="text-muted">Score</dt>
              <dd className="text-right">{rating.ratingScore}/5</dd>
              <dt className="text-muted">As of</dt>
              <dd className="text-right">{formatDate(rating.date)}</dd>
            </dl>
          ) : (
            <p className="text-sm text-muted">No rating data available.</p>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b p-4">
          <h3 className="font-medium">Analyst Estimates</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Est. Revenue (Low)</th>
                <th>Est. Revenue (Avg)</th>
                <th>Est. Revenue (High)</th>
                <th>Est. EPS (Low)</th>
                <th>Est. EPS (Avg)</th>
                <th>Est. EPS (High)</th>
                <th># Analysts</th>
              </tr>
            </thead>
            <tbody>
              {estimates.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-muted">No estimate data available.</td>
                </tr>
              )}
              {estimates.map((e) => (
                <tr key={e.date}>
                  <td className="text-left">{formatDate(e.date)}</td>
                  <td>{formatCompact(e.estimatedRevenueLow)}</td>
                  <td>{formatCompact(e.estimatedRevenueAvg)}</td>
                  <td>{formatCompact(e.estimatedRevenueHigh)}</td>
                  <td>{e.estimatedEpsLow?.toFixed(2) ?? "—"}</td>
                  <td>{e.estimatedEpsAvg?.toFixed(2) ?? "—"}</td>
                  <td>{e.estimatedEpsHigh?.toFixed(2) ?? "—"}</td>
                  <td>{e.numberAnalystsEstimatedEps ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b p-4">
          <h3 className="font-medium">Recent Upgrades / Downgrades</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Firm</th>
                <th>Action</th>
                <th>New Grade</th>
                <th>Previous Grade</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {upgradesDowngrades.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted">No recent analyst actions.</td>
                </tr>
              )}
              {upgradesDowngrades.slice(0, 15).map((u, i) => (
                <tr key={`${u.gradingCompany}-${i}`}>
                  <td className="max-w-[200px] truncate text-left">{u.gradingCompany}</td>
                  <td>{u.action}</td>
                  <td>{u.newGrade}</td>
                  <td>{u.previousGrade ?? "—"}</td>
                  <td>{formatDate(u.publishedDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
