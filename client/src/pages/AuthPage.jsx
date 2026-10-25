import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { login, register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) await login({ email: form.email, password: form.password });
      else await register(form);
      // On success the user is set and the route guard redirects to the dashboard
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-600 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-xl"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">
            💸 Expense Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLogin ? "Log in to your account" : "Create your account"}
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
            {error}
          </p>
        )}

        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={set("name")}
            className={inputClass}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={set("email")}
          className={inputClass}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={form.password}
          onChange={set("password")}
          className={inputClass}
          required
        />

        <button
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Please wait..." : isLogin ? "Log in" : "Register"}
        </button>

        <p className="text-center text-sm text-slate-500">
          {isLogin ? "No account yet? " : "Already registered? "}
          <Link
            to={isLogin ? "/register" : "/login"}
            className="font-medium text-indigo-600 hover:underline"
          >
            {isLogin ? "Register" : "Log in"}
          </Link>
        </p>
      </form>
    </div>
  );
}
