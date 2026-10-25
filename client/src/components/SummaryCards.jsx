import { inr } from "../utils";

export default function SummaryCards({ summary }) {
  const cards = [
    { label: "Balance", value: summary?.balance, color: "text-indigo-600" },
    { label: "Income", value: summary?.totalIncome, color: "text-emerald-600" },
    {
      label: "Expenses",
      value: summary?.totalExpenses,
      color: "text-rose-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
        >
          <p className="text-sm text-slate-500">{c.label}</p>
          <p className={`mt-1 text-3xl font-bold ${c.color}`}>
            {c.value === undefined ? "—" : inr(c.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
