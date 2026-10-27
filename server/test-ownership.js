// Run with the server already running:  node test-ownership.js
const BASE = process.env.API_URL || "http://localhost:5000/api";
const stamp = Date.now(); // makes emails unique on every run

async function call(method, path, token, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json() };
}

function check(label, passed, detail) {
  console.log(
    `${passed ? "PASS" : "FAIL"}  ${label}${passed ? "" : "  -> " + detail}`,
  );
}

(async () => {
  // Two new users
  const a = await call("POST", "/auth/register", null, {
    name: "User A",
    email: `a${stamp}@test.com`,
    password: "secret123",
  });
  const b = await call("POST", "/auth/register", null, {
    name: "User B",
    email: `b${stamp}@test.com`,
    password: "secret123",
  });

  await call("POST", "/transactions", a.data.token, {
    type: "income",
    amount: 1000,
    category: "Salary",
  });

  // User A creates a transaction
  const created = await call("POST", "/transactions", a.data.token, {
    type: "expense",
    amount: 250,
    category: "Food",
    note: "A's lunch",
  });
  const id = created.data._id;
  check("A can create a transaction", created.status === 201, created.status);

  // B tries to reach it
  const list = await call("GET", "/transactions", b.data.token);
  check(
    "B's list is empty",
    list.status === 200 && list.data.transactions.length === 0,
    JSON.stringify(list.data),
  );

  const put = await call("PUT", `/transactions/${id}`, b.data.token, {
    amount: 1,
    note: "hacked",
  });
  check(
    "B cannot update A's transaction (404)",
    put.status === 404,
    put.status,
  );

  const del = await call("DELETE", `/transactions/${id}`, b.data.token);
  check(
    "B cannot delete A's transaction (404)",
    del.status === 404,
    del.status,
  );

  // A's data must be unchanged
  const after = await call("GET", "/transactions", a.data.token);
  const stillThere = after.data.transactions.find((t) => t._id === id);
  check(
    "A's transaction is untouched",
    stillThere && stillThere.amount === 250 && stillThere.note === "A's lunch",
    JSON.stringify(stillThere),
  );

  // No token at all
  const noToken = await call("GET", "/transactions");
  check("No token is rejected (401)", noToken.status === 401, noToken.status);
})();
