import { useState } from "react";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "../categories";
import { today, inr } from "../utils";

const empty = {
  type: "expense",
  amount: "",
  category: "Food",
  date: today(),
  note: "",
};
const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

const categoriesFor = (type) =>
  type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

export default function TransactionForm({ onAdd, available }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  // Switching type also switches the category list; keep the category if it's still valid
  const setType = (type) => {
    const options = categoriesFor(type);
    setForm({
      ...form,
      type,
      category: options.includes(form.category) ? form.category : options[0],
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const amount = Number(form.amount);
    if (
      form.type === "expense" &&
      available !== undefined &&
      Math.round(amount * 100) > Math.round(available * 100)
    ) {
      setError(`Insufficient balance. You have ${inr(available)} available.`);
      return;
    }
    setSaving(true);
    try {
      await onAdd({ ...form, amount: Number(form.amount) });
      setForm({ ...empty, date: form.date }); // clear the form, keep the date
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <h2 className="font-semibold">Add transaction</h2>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {["expense", "income"].map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setType(t)}
            className={`rounded-md py-2 text-sm font-medium capitalize ${
              form.type === t
                ? "bg-white text-indigo-600 shadow"
                : "text-slate-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <input
        type="number"
        min="0.01"
        step="any"
        placeholder="Amount"
        value={form.amount}
        onChange={set("amount")}
        className={inputClass}
        required
      />
      {form.type === "expense" && available !== undefined && (
        <p className="-mt-1 text-xs text-slate-500">
          Available to spend: {inr(available)}
        </p>
      )}
      <select
        value={form.category}
        onChange={set("category")}
        className={inputClass}
      >
        {categoriesFor(form.type).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <input
        type="date"
        max={today()}
        value={form.date}
        onChange={set("date")}
        className={inputClass}
        required
      />
      <input
        type="text"
        maxLength={100}
        placeholder="Note (optional)"
        value={form.note}
        onChange={set("note")}
        className={inputClass}
      />

      <button
        disabled={saving}
        className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Add"}
      </button>
    </form>
  );
}
