import { useState } from "react";
import { CATEGORIES } from "../categories";
import { inr } from "../utils";

export default function TransactionList({ transactions, onDelete }) {
  const [category, setCategory] = useState("All");
  const shown =
    category === "All"
      ? transactions
      : transactions.filter((t) => t.category === category);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Transactions</h2>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
        >
          <option>All</option>
          {Object.keys(CATEGORIES).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {shown.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-400">
          No transactions yet
        </p>
      )}

      <ul className="divide-y divide-slate-100">
        {shown.map((t) => (
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
                {new Date(t.date + "T00:00:00").toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
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
    </div>
  );
}
