import { CATEGORIES } from "../categories";
import { inr } from "../utils";

export default function CategoryBreakdown({ summary }) {
  const rows = summary?.expensesByCategory || [];
  const total = summary?.totalExpenses || 1;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 font-semibold">Spending by category</h2>
      {!summary && <p className="text-sm text-slate-400">Loading...</p>}
      {summary && rows.length === 0 && (
        <p className="text-sm text-slate-400">No expenses this month</p>
      )}
      <div className="space-y-3">
        {rows.map(({ category, total: amount }) => (
          <div key={category}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{category}</span>
              <span className="text-slate-500">{inr(amount)}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${CATEGORIES[category]}`}
                style={{ width: `${(amount / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
