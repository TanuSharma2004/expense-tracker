// Run with the server already running:  node seed-test-data.js
const BASE = process.env.API_URL || "http://localhost:5000/api";

const data = [
  // September 2026
  {
    type: "income",
    amount: 50000,
    category: "Salary",
    date: "2026-09-01",
    note: "September salary",
  },
  {
    type: "expense",
    amount: 12000,
    category: "Bills",
    date: "2026-09-02",
    note: "Rent",
  },
  {
    type: "expense",
    amount: 500,
    category: "Food",
    date: "2026-09-10",
    note: "Groceries",
  },
  {
    type: "expense",
    amount: 1800,
    category: "Shopping",
    date: "2026-09-15",
    note: "Clothes",
  },
  {
    type: "expense",
    amount: 400,
    category: "Transport",
    date: "2026-09-28",
    note: "Cab",
  },
  {
    type: "expense",
    amount: 350,
    category: "Food",
    date: "2026-09-30",
    note: "Dinner",
  },
  // October 2026
  {
    type: "income",
    amount: 50000,
    category: "Salary",
    date: "2026-10-01",
    note: "October salary",
  },
  {
    type: "expense",
    amount: 12000,
    category: "Bills",
    date: "2026-10-02",
    note: "Rent",
  },
  {
    type: "expense",
    amount: 450,
    category: "Food",
    date: "2026-10-03",
    note: "Groceries",
  },
  {
    type: "expense",
    amount: 200,
    category: "Transport",
    date: "2026-10-05",
    note: "Metro card",
  },
  {
    type: "expense",
    amount: 300,
    category: "Food",
    date: "2026-10-07",
    note: "Dinner out",
  },
  {
    type: "expense",
    amount: 2500,
    category: "Shopping",
    date: "2026-10-09",
    note: "Shoes",
  },
  {
    type: "expense",
    amount: 600,
    category: "Entertainment",
    date: "2026-10-12",
    note: "Movie",
  },
  {
    type: "expense",
    amount: 250,
    category: "Food",
    date: "2026-10-14",
    note: "Lunch",
  },
  {
    type: "income",
    amount: 1500,
    category: "Other",
    date: "2026-10-15",
    note: "Freelance",
  },
  {
    type: "expense",
    amount: 800,
    category: "Health",
    date: "2026-10-18",
    note: "Pharmacy",
  },
  {
    type: "expense",
    amount: 350,
    category: "Transport",
    date: "2026-10-20",
    note: "Cab",
  },
  {
    type: "expense",
    amount: 900,
    category: "Bills",
    date: "2026-10-22",
    note: "Electricity",
  },
  {
    type: "expense",
    amount: 200,
    category: "Food",
    date: "2026-10-25",
    note: "Snacks",
  },
];

(async () => {
  const email = `seed${Date.now()}@test.com`;

  const reg = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Seed User", email, password: "secret123" }),
  });
  const user = await reg.json();
  if (!reg.ok) {
    console.error("Register failed:", user);
    process.exit(1);
  }

  for (const t of data) {
    const res = await fetch(`${BASE}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(t),
    });
    if (!res.ok) {
      console.error("Failed to create:", t, await res.json());
      process.exit(1);
    }
  }

  console.log(`Created ${data.length} transactions`);
  console.log("Email:   ", email);
  console.log("Password: secret123");
  console.log("Token:   ", user.token);
})();
