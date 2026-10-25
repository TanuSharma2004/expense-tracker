import { useState } from "react";
import { CATEGORIES } from "../categories";
import { today } from "../utils";

const empty = {
  type: "expense",
  amount: "",
  category: "Food",
  date: today(),
  note: "",
};
const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

export default function TransactionForm({ onAdd }) {
  const [form, setForm] = useState(empty);
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (Number(form.amount) <= 0) return;
    onAdd({ ...form, amount: Number(form.amount) });
    setForm({ ...empty, date: form.date }); // clear the form, keep the date
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <h2 className="font-semibold">Add transaction</h2>

      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {["expense", "income"].map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setForm({ ...form, type: t })}
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
        min="1"
        placeholder="Amount"
        value={form.amount}
        onChange={set("amount")}
        className={inputClass}
        required
      />
      <select
        value={form.category}
        onChange={set("category")}
        className={inputClass}
      >
        {Object.keys(CATEGORIES).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <input
        type="date"
        value={form.date}
        onChange={set("date")}
        className={inputClass}
        required
      />
      <input
        type="text"
        placeholder="Note (optional)"
        value={form.note}
        onChange={set("note")}
        className={inputClass}
      />

      <button className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
        Add
      </button>
    </form>
  );
}
