import { CATEGORIES } from "../categories";
import { inr } from "../utils";

export default function CategoryBreakdown({ transactions }) {
  // Add up expenses per category
  const totals = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });

  const rows = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const total = rows.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 font-semibold">Spending by category</h2>
      {rows.length === 0 && (
        <p className="text-sm text-slate-400">No expenses this month</p>
      )}
      <div className="space-y-3">
        {rows.map(([name, value]) => (
          <div key={name}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{name}</span>
              <span className="text-slate-500">{inr(value)}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${CATEGORIES[name]}`}
                style={{ width: `${(value / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
