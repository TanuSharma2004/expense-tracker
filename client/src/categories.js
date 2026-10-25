// category name -> color class (used for the icons and bars)
export const CATEGORIES = {
  Food: "bg-orange-500",
  Transport: "bg-sky-500",
  Shopping: "bg-pink-500",
  Bills: "bg-violet-500",
  Health: "bg-emerald-500",
  Entertainment: "bg-amber-500",
  Salary: "bg-teal-500",
  Other: "bg-slate-400",
};

// Which categories each type may use (keep in sync with server/models/Transaction.js)
export const INCOME_CATEGORIES = ["Salary", "Other"];
export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Other",
];
