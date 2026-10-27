const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const { withUserLock } = require("../utils/userLock");
const {
  getBalance,
  assertBalanceAllows,
  round2,
  signed,
} = require("../utils/balance");

const CATEGORIES = Transaction.schema.path("category").enumValues; // reuse the model's list
const TYPES = ["income", "expense"];

// Only these fields can be set by the client
const FIELDS = ["type", "amount", "category", "date", "note"];
const pick = (body) =>
  Object.fromEntries(
    FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]),
  );

// Throw this to stop and answer with a specific status and message
const fail = (status, message) => Object.assign(new Error(message), { status });

const handleError = (res, error) => {
  if (error.status)
    return res.status(error.status).json({ message: error.message });
  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)
      .map((e) => e.message)
      .join(", ");
    return res.status(400).json({ message });
  }
  console.error(error);
  res.status(500).json({ message: "Server error" });
};

// "2026-10-25" -> Date at UTC midnight, or null if it isn't a real date
const parseDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  if (isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) return null;
  return d;
};

// POST /api/transactions
exports.createTransaction = async (req, res) => {
  try {
    const transaction = new Transaction({
      ...pick(req.body),
      user: req.user._id,
    });
    await transaction.validate(); // bad input gets a validation error before any balance logic

    // One request per user at a time, so two expenses can't both spend the same money
    await withUserLock(String(req.user._id), async () => {
      await assertBalanceAllows(
        req.user._id,
        signed(transaction),
        (b) => `Insufficient balance. You have ${b} available.`,
      );
      await transaction.save();
    });

    res.status(201).json(transaction);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/transactions?type=&category=&startDate=&endDate=&page=&limit=
exports.getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

    // Always scoped to the logged-in user
    const filter = { user: req.user._id };

    // Validate every query value before it goes anywhere near the database
    if (type) {
      if (!TYPES.includes(type)) {
        return res
          .status(400)
          .json({ message: "Type must be income or expense" });
      }
      filter.type = type;
    }

    if (category) {
      if (!CATEGORIES.includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const d = parseDate(startDate);
        if (!d)
          return res
            .status(400)
            .json({ message: "startDate must be in YYYY-MM-DD format" });
        filter.date.$gte = d; // from the start of that day
      }
      if (endDate) {
        const d = parseDate(endDate);
        if (!d)
          return res
            .status(400)
            .json({ message: "endDate must be in YYYY-MM-DD format" });
        filter.date.$lt = new Date(d.getTime() + 24 * 60 * 60 * 1000); // up to the end of that day
      }
    }

    // Run the page query and the count at the same time
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ date: -1, createdAt: -1, _id: -1 }) // _id keeps the order stable between pages
        .skip((page - 1) * limit)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      transactions,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/transactions/summary?month=2026-10
exports.getSummary = async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7); // default: current month
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res
        .status(400)
        .json({ message: "month must be in YYYY-MM format" });
    }

    const [year, mon] = month.split("-").map(Number);
    const start = new Date(Date.UTC(year, mon - 1, 1));
    const end = new Date(Date.UTC(year, mon, 1)); // first day of the NEXT month

    const [rows, availableBalance] = await Promise.all([
      // The aggregation pipeline: each stage feeds the next one
      Transaction.aggregate([
        // 1. Keep only this user's transactions inside the month
        { $match: { user: req.user._id, date: { $gte: start, $lt: end } } },
        // 2. Group them by type + category and add up the amounts
        {
          $group: {
            _id: { type: "$type", category: "$category" },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        // 3. Biggest totals first
        { $sort: { total: -1 } },
      ]),
      getBalance(req.user._id), // money available overall, not just this month
    ]);

    // Reshape the grouped rows into the response
    const summary = {
      month,
      availableBalance, // all months combined: what you can still spend
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0, // this month only: income minus expenses
      expensesByCategory: [],
      incomeByCategory: [],
    };

    rows.forEach(({ _id, total, count }) => {
      const entry = { category: _id.category, total: round2(total), count };
      if (_id.type === "income") {
        summary.totalIncome += total;
        summary.incomeByCategory.push(entry);
      } else {
        summary.totalExpenses += total;
        summary.expensesByCategory.push(entry);
      }
    });

    summary.totalIncome = round2(summary.totalIncome);
    summary.totalExpenses = round2(summary.totalExpenses);
    summary.balance = round2(summary.totalIncome - summary.totalExpenses);

    res.json(summary);
  } catch (error) {
    handleError(res, error);
  }
};

// PUT /api/transactions/:id
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw fail(404, "Transaction not found");

    const transaction = await withUserLock(String(req.user._id), async () => {
      // Looking up by BOTH id and user is what enforces ownership
      const t = await Transaction.findOne({ _id: id, user: req.user._id });
      if (!t) throw fail(404, "Transaction not found");

      const effectBefore = signed(t);
      t.set(pick(req.body));
      await t.validate(); // bad input gets a validation error before any balance logic

      // The change in balance is the new effect minus the old one
      await assertBalanceAllows(
        req.user._id,
        signed(t) - effectBefore,
        (b) =>
          `This change would make your balance negative. Current balance: ${b}`,
      );
      await t.save();
      return t;
    });

    res.json(transaction);
  } catch (error) {
    handleError(res, error);
  }
};

// DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw fail(404, "Transaction not found");

    await withUserLock(String(req.user._id), async () => {
      const t = await Transaction.findOne({ _id: id, user: req.user._id });
      if (!t) throw fail(404, "Transaction not found");

      // Deleting an expense raises the balance, so only deleting income can be refused
      await assertBalanceAllows(
        req.user._id,
        -signed(t),
        (b) =>
          `You can't delete this income because your expenses would then exceed your balance. Current balance: ${b}`,
      );
      await t.deleteOne();
    });

    res.json({ message: "Transaction deleted", _id: id });
  } catch (error) {
    handleError(res, error);
  }
};
