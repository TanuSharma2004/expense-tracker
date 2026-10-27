import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import * as api from "../api";
import { today } from "../utils";
import SummaryCards from "../components/SummaryCards";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import CategoryBreakdown from "../components/CategoryBreakdown";

const PAGE_SIZE = 8;

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [month, setMonth] = useState(today().slice(0, 7)); // "2026-10"
  const [filters, setFilters] = useState({ type: "", category: "" });
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState(null);
  const [list, setList] = useState({
    transactions: [],
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // bump it to reload everything

  const refresh = () => setRefreshKey((k) => k + 1);
  const changeMonth = (m) => {
    setMonth(m);
    setPage(1);
  };
  const changeFilters = (f) => {
    setFilters(f);
    setPage(1);
  };

  // Monthly summary from the aggregation endpoint
  useEffect(() => {
    let ignore = false; // drops answers that arrive after the inputs changed
    api
      .getSummary(month)
      .then((data) => !ignore && setSummary(data))
      .catch((err) => !ignore && setError(err.message));
    return () => {
      ignore = true;
    };
  }, [month, refreshKey]);

  // Filtered, paginated list for the selected month
  useEffect(() => {
    let ignore = false;
    const [y, m] = month.split("-").map(Number);
    const lastDay = String(new Date(y, m, 0).getDate()).padStart(2, "0");

    setLoading(true);
    setError("");
    api
      .getTransactions({
        ...filters,
        startDate: `${month}-01`,
        endDate: `${month}-${lastDay}`,
        page,
        limit: PAGE_SIZE,
      })
      .then((data) => !ignore && setList(data))
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [month, filters, page, refreshKey]);

  const handleAdd = async (t) => {
    await api.addTransaction(t); // the form shows the error if this throws
    const addedMonth = t.date.slice(0, 7);
    if (addedMonth !== month) setMonth(addedMonth); // jump to the month it belongs to
    setPage(1);
    refresh();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await api.deleteTransaction(id);
      // If that was the last item on this page, go back one page
      if (list.transactions.length === 1 && page > 1) setPage(page - 1);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6">
          <h1 className="text-2xl font-bold">💸 Expense Tracker</h1>
          <div className="flex items-center gap-3">
            <input
              type="month"
              max={today().slice(0, 7)}
              value={month}
              onChange={(e) => e.target.value && changeMonth(e.target.value)}
              className="rounded-lg bg-white/20 px-3 py-2 text-sm outline-none [color-scheme:dark]"
            />
            <span className="hidden text-sm sm:inline">Hi, {user.name}</span>
            <button
              onClick={logout}
              className="rounded-lg bg-white/20 px-3 py-2 text-sm font-medium hover:bg-white/30"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {error && (
          <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
            {error}
          </div>
        )}

        <SummaryCards summary={summary} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <TransactionForm
              onAdd={handleAdd}
              available={summary?.availableBalance}
            />
            <CategoryBreakdown summary={summary} />
          </div>
          <div className="lg:col-span-2">
            <TransactionList
              transactions={list.transactions}
              total={list.total}
              page={page}
              totalPages={list.totalPages}
              filters={filters}
              loading={loading}
              onFilters={changeFilters}
              onPage={setPage}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
