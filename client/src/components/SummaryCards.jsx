import { inr } from "../utils";

export default function SummaryCards({ transactions }) {
  const sum = (type) =>
    transactions
      .filter((t) => t.type === type)
      .reduce((s, t) => s + t.amount, 0);
  const income = sum("income");
  const expense = sum("expense");

  const cards = [
    { label: "Balance", value: income - expense, color: "text-indigo-600" },
    { label: "Income", value: income, color: "text-emerald-600" },
    { label: "Expenses", value: expense, color: "text-rose-600" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
        >
          <p className="text-sm text-slate-500">{c.label}</p>
          <p className={`mt-1 text-3xl font-bold ${c.color}`}>{inr(c.value)}</p>
        </div>
      ))}
    </div>
  );
}
