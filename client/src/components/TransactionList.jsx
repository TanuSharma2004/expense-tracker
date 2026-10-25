import {
  CATEGORIES,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from "../categories";
import { inr } from "../utils";

const selectClass = "rounded-lg border border-slate-300 px-2 py-1 text-sm";

export default function TransactionList({
  transactions,
  total,
  page,
  totalPages,
  filters,
  loading,
  onFilters,
  onPage,
  onDelete,
}) {
  // The category filter only lists categories that fit the selected type
  const options =
    filters.type === "income"
      ? INCOME_CATEGORIES
      : filters.type === "expense"
        ? EXPENSE_CATEGORIES
        : Object.keys(CATEGORIES);

  const changeType = (type) => {
    const allowed =
      type === "income"
        ? INCOME_CATEGORIES
        : type === "expense"
          ? EXPENSE_CATEGORIES
          : null;
    // Clear the category filter if it no longer fits the new type
    const category =
      allowed && !allowed.includes(filters.category) ? "" : filters.category;
    onFilters({ ...filters, type, category });
  };
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">
          Transactions{" "}
          <span className="text-sm font-normal text-slate-400">({total})</span>
        </h2>
        <div className="flex gap-2">
          <select
            value={filters.type}
            onChange={(e) => changeType(e.target.value)}
            className={selectClass}
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) =>
              onFilters({ ...filters, category: e.target.value })
            }
            className={selectClass}
          >
            <option value="">All categories</option>
            {options.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && transactions.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-400">Loading...</p>
      )}
      {!loading && transactions.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-400">
          No transactions found
        </p>
      )}

      <ul
        className={`divide-y divide-slate-100 ${loading ? "opacity-50" : ""}`}
      >
        {transactions.map((t) => (
          <li key={t._id} className="flex items-center gap-3 py-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${CATEGORIES[t.category]}`}
            >
              {t.category[0]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {t.note || t.category}
              </p>
              <p className="text-xs text-slate-400">
                {t.category} ·{" "}
                {new Date(t.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  timeZone: "UTC",
                })}
              </p>
            </div>
            <p
              className={`text-sm font-semibold ${t.type === "income" ? "text-emerald-600" : "text-rose-600"}`}
            >
              {t.type === "income" ? "+" : "-"}
              {inr(t.amount)}
            </p>
            <button
              onClick={() => onDelete(t._id)}
              aria-label="Delete"
              className="text-slate-300 hover:text-rose-500"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            className="rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-50 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPage(page + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-50 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
