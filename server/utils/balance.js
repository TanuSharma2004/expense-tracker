const Transaction = require("../models/Transaction");

const cents = (n) => Math.round(n * 100); // compare money as whole cents, not floats
const round2 = (n) => Math.round(n * 100) / 100;

// How much a transaction adds to (+) or takes from (-) the balance
const signed = (t) => (t.type === "income" ? t.amount : -t.amount);

// Income minus expenses across ALL of a user's transactions
async function getBalance(userId) {
  const rows = await Transaction.aggregate([
    { $match: { user: userId } },
    { $group: { _id: "$type", total: { $sum: "$amount" } } },
  ]);
  const total = (type) => rows.find((r) => r._id === type)?.total || 0;
  return round2(total("income") - total("expense"));
}

// Throws a 400 error if changing the balance by `delta` would push it below zero.
// A change that doesn't lower the balance is always allowed.
async function assertBalanceAllows(userId, delta, makeMessage) {
  if (cents(delta) >= 0) return;
  const balance = await getBalance(userId);
  if (cents(balance) + cents(delta) < 0) {
    const shown = balance.toLocaleString("en-IN", { maximumFractionDigits: 2 });
    throw Object.assign(new Error(makeMessage(shown)), { status: 400 });
  }
}

module.exports = { getBalance, assertBalanceAllows, round2, signed };
