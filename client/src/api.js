const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

// One helper that every API call goes through
async function request(path, { method = "GET", body, params } = {}) {
  const user = getStoredUser();

  // Build ?a=1&b=2, skipping empty values
  const query = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== "" && v != null),
      )
    : "";

  let res;
  try {
    res = await fetch(BASE + path + query, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(user && { Authorization: `Bearer ${user.token}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Is it running?");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // A 401 while logged in means the token expired or is invalid: force a logout
    if (res.status === 401 && user)
      window.dispatchEvent(new Event("auth-expired"));
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

export const register = (body) =>
  request("/auth/register", { method: "POST", body });
export const login = (body) => request("/auth/login", { method: "POST", body });
export const getTransactions = (params) => request("/transactions", { params });
export const getSummary = (month) =>
  request("/transactions/summary", { params: { month } });
export const addTransaction = (body) =>
  request("/transactions", { method: "POST", body });
export const deleteTransaction = (id) =>
  request(`/transactions/${id}`, { method: "DELETE" });
