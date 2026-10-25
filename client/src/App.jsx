import { useEffect, useMemo, useState } from "react";
import { getTransactions, addTransaction, deleteTransaction } from "./api";
import { today } from "./utils";
import SummaryCards from "./components/SummaryCards";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import CategoryBreakdown from "./components/CategoryBreakdown";

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState(today().slice(0, 7)); // e.g. "2026-10"

  const load = async () => setTransactions(await getTransactions());
  useEffect(() => {
    load();
  }, []);

  // Only show the selected month
  const monthly = useMemo(
    () => transactions.filter((t) => t.date.startsWith(month)),
    [transactions, month]
  );

  const handleAdd = async (t) => {
    await addTransaction(t);
    load();
  };
  const handleDelete = async (id) => {
    await deleteTransaction(id);
    load();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <h1 className="text-2xl font-bold">💸 Expense Tracker</h1>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg bg-white/20 px-3 py-2 text-sm outline-none [color-scheme:dark]"
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <SummaryCards transactions={monthly} />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <TransactionForm onAdd={handleAdd} />
            <CategoryBreakdown transactions={monthly} />
          </div>
          <div className="lg:col-span-2">
            <TransactionList transactions={monthly} onDelete={handleDelete} />
          </div>
        </div>
      </main>
    </div>
  );
}