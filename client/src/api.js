// TEMPORARY: stores data in the browser's localStorage.
// Later we replace these three functions with fetch() calls to the Express API.
const KEY = "transactions";
const read = () => JSON.parse(localStorage.getItem(KEY) || "[]");
const write = (data) => localStorage.setItem(KEY, JSON.stringify(data));

export async function getTransactions() {
  return read().sort((a, b) => b.date.localeCompare(a.date));
}

export async function addTransaction(t) {
  const item = { ...t, _id: crypto.randomUUID() };
  write([...read(), item]);
  return item;
}

export async function deleteTransaction(id) {
  write(read().filter((t) => t._id !== id));
}