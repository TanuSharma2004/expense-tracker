import { inr } from "../utils";

export default function SummaryCards({ summary }) {
  const cards = [
    {
      label: "Available balance",
      note: "All months",
      value: summary?.availableBalance,
      color: "text-indigo-600",
    },
    {
      label: "Income",
      note: "This month",
      value: summary?.totalIncome,
      color: "text-emerald-600",
    },
    {
      label: "Expenses",
      note: "This month",
      value: summary?.totalExpenses,
      color: "text-rose-600",
    },
    {
      label: "Net",
      note: "This month",
      value: summary?.balance,
      color: "text-slate-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
        >
          <p className="text-sm text-slate-500">{c.label}</p>
          <p className={`mt-1 text-2xl font-bold sm:text-3xl ${c.color}`}>
            {c.value === undefined ? "—" : inr(c.value)}
          </p>
          <p className="mt-1 text-xs text-slate-400">{c.note}</p>
        </div>
      ))}
    </div>
  );
}
