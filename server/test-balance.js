// Run with the server already running:  node test-balance.js
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

let failures = 0;
function check(label, passed, detail) {
  if (!passed) failures++;
  console.log(
    `${passed ? "PASS" : "FAIL"}  ${label}${passed ? "" : "  -> " + detail}`,
  );
}
const insufficient = (r) => r.status === 400 && /balance/i.test(r.data.message);

async function register(name) {
  const r = await call("POST", "/auth/register", null, {
    name,
    email: `${name}${stamp}@test.com`,
    password: "secret123",
  });
  if (!r.data.token) {
    console.error("Could not register:", r.data);
    process.exit(1);
  }
  return r.data.token;
}

(async () => {
  const A = await register("a");
  const tx = (body, tok = A) => call("POST", "/transactions", tok, body);
  const put = (id, body, tok = A) =>
    call("PUT", `/transactions/${id}`, tok, body);
  const del = (id, tok = A) => call("DELETE", `/transactions/${id}`, tok);
  const available = async (tok = A) =>
    (await call("GET", "/transactions/summary", tok)).data.availableBalance;
  const info = (r) => `${r.status} ${JSON.stringify(r.data)}`;

  // Creating
  const noMoney = await tx({ type: "expense", amount: 10, category: "Food" });
  check(
    "expense with no income is rejected (400)",
    insufficient(noMoney),
    info(noMoney),
  );

  const income = await tx({ type: "income", amount: 1000, category: "Salary" });
  check("income is always allowed (201)", income.status === 201, info(income));

  const tooMuch = await tx({ type: "expense", amount: 1500, category: "Food" });
  check(
    "expense above the balance is rejected (400)",
    insufficient(tooMuch),
    info(tooMuch),
  );
  check(
    "...and nothing was saved",
    (await available()) === 1000,
    await available(),
  );

  const e1 = await tx({ type: "expense", amount: 600, category: "Food" });
  check(
    "expense within the balance is allowed (201)",
    e1.status === 201,
    info(e1),
  );

  const oneCent = await tx({
    type: "expense",
    amount: 400.01,
    category: "Food",
  });
  check(
    "one cent over the balance is rejected (400)",
    insufficient(oneCent),
    info(oneCent),
  );

  const e2 = await tx({ type: "expense", amount: 400, category: "Bills" });
  check(
    "spending the exact balance is allowed (201)",
    e2.status === 201,
    info(e2),
  );
  check(
    "available balance is now 0",
    (await available()) === 0,
    await available(),
  );

  const badAmount = await tx({ type: "expense", amount: -5, category: "Food" });
  check(
    "invalid input gets a validation error, not a balance error",
    badAmount.status === 400 && /greater than 0/.test(badAmount.data.message),
    info(badAmount),
  );

  // Updating
  const up1 = await put(e1.data._id, { amount: 700 });
  check(
    "raising an expense beyond the balance is rejected (400)",
    insufficient(up1),
    info(up1),
  );
  const up2 = await put(e1.data._id, { amount: 500 });
  check(
    "lowering an expense is allowed (200)",
    up2.status === 200 && (await available()) === 100,
    info(up2),
  );
  const up3 = await put(income.data._id, { amount: 950 });
  check(
    "lowering income within the balance is allowed (200)",
    up3.status === 200 && (await available()) === 50,
    info(up3),
  );
  const up4 = await put(income.data._id, { amount: 800 });
  check(
    "lowering income below what was spent is rejected (400)",
    insufficient(up4),
    info(up4),
  );
  const up5 = await put(income.data._id, { type: "expense", category: "Food" });
  check(
    "turning income into an expense is checked too (400)",
    insufficient(up5),
    info(up5),
  );
  const up6 = await put(e1.data._id, { note: "renamed" });
  check(
    "edits that don't change the balance are allowed (200)",
    up6.status === 200,
    info(up6),
  );

  // Deleting
  const delIncome = await del(income.data._id);
  check(
    "deleting income that funded spending is rejected (400)",
    insufficient(delIncome),
    info(delIncome),
  );
  const delExpense = await del(e2.data._id);
  check(
    "deleting an expense is allowed (200)",
    delExpense.status === 200 && (await available()) === 450,
    info(delExpense),
  );
  await del(e1.data._id);
  const delIncome2 = await del(income.data._id);
  check(
    "income can be deleted once nothing depends on it (200)",
    delIncome2.status === 200 && (await available()) === 0,
    info(delIncome2),
  );

  // Simultaneous requests: only what the money covers may succeed
  const B = await register("b");
  await tx({ type: "income", amount: 1000, category: "Salary" }, B);
  const results = await Promise.all(
    Array.from({ length: 5 }, () =>
      tx({ type: "expense", amount: 300, category: "Food" }, B),
    ),
  );
  const ok = results.filter((r) => r.status === 201).length;
  const blocked = results.filter(insufficient).length;
  check(
    "5 simultaneous expenses of 300 against 1000: exactly 3 succeed",
    ok === 3 && blocked === 2,
    `ok ${ok}, blocked ${blocked}`,
  );
  check(
    "balance ends at 100, never negative",
    (await available(B)) === 100,
    await available(B),
  );

  // Users don't share money
  const C = await register("c");
  const cSpend = await tx({ type: "expense", amount: 10, category: "Food" }, C);
  check(
    "another user's money doesn't count (400)",
    insufficient(cSpend),
    info(cSpend),
  );
  check(
    "a new user's available balance is 0",
    (await available(C)) === 0,
    await available(C),
  );

  console.log(
    failures === 0 ? "\nAll checks passed" : `\n${failures} check(s) failed`,
  );
})();
