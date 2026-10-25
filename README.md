# 💸 Expense Tracker

A full-stack MERN application for tracking income and expenses. Each user has a private account, can filter and paginate their transactions, and gets a monthly summary computed by MongoDB aggregation.

**Live demo:** [https://expense-tracker-tanu-sharma.vercel.app](https://expense-tracker-tanu-sharma.vercel.app) · **API:** [https://expense-tracker-api-ydpv.onrender.com](https://expense-tracker-api-ydpv.onrender.com)

> The API runs on a free Render instance that sleeps after 15 minutes of inactivity. The first request after a pause can take up to a minute.

![Dashboard](docs/dashboard.png)

## Features

- Register and log in with JWT authentication and bcrypt-hashed passwords
- Add, list and delete income and expense transactions (an edit endpoint is available in the API)
- Categories that depend on the transaction type: income uses Salary or Other, expenses use Food, Transport, Shopping, Bills, Health, Entertainment or Other
- Filter by type, category and date range, with server-side pagination
- Monthly summary: total income, total expenses, balance and a per-category breakdown
- Every user can only read and change their own data
- Validation on both the client and the server (positive amounts, valid categories, no future dates)
- Responsive interface built with Tailwind CSS

## Tech stack

| Layer    | Technology                                              |
| -------- | ------------------------------------------------------- |
| Frontend | React (Vite), React Router, Tailwind CSS                |
| Backend  | Node.js, Express                                        |
| Database | MongoDB Atlas, Mongoose                                 |
| Auth     | JSON Web Tokens, bcryptjs                               |
| Security | helmet, express-rate-limit, restricted CORS             |
| Hosting  | Vercel (client), Render (API), MongoDB Atlas (database) |

## Project structure

```
expense-tracker/
├── client/                  React app
│   └── src/
│       ├── components/      SummaryCards, TransactionForm, TransactionList, CategoryBreakdown
│       ├── pages/           AuthPage (login/register), Dashboard
│       ├── api.js           All HTTP calls to the API
│       ├── AuthContext.jsx  Logged-in user state and token storage
│       └── categories.js    Category lists and colors
└── server/                  Express API
    ├── config/              Database connection
    ├── controllers/         Auth and transaction logic
    ├── middleware/          JWT verification (protect)
    ├── models/              User and Transaction schemas
    ├── routes/              Route definitions
    └── server.js            App setup, CORS, rate limiting
```

## API reference

Base URL: `https://expense-tracker-api-ydpv.onrender.com/api`

Protected routes need the header `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint         | Auth | Description                           |
| ------ | ---------------- | ---- | ------------------------------------- |
| POST   | `/auth/register` | No   | Create an account and receive a token |
| POST   | `/auth/login`    | No   | Log in and receive a token            |

Request body for both: `email` and `password`. Register also takes `name`.

```json
{ "name": "Test User", "email": "test@example.com", "password": "secret123" }
```

Response:

```json
{
  "_id": "6540...",
  "name": "Test User",
  "email": "test@example.com",
  "token": "eyJhbGciOi..."
}
```

### Transactions

| Method | Endpoint                | Auth | Description                                                |
| ------ | ----------------------- | ---- | ---------------------------------------------------------- |
| GET    | `/transactions`         | Yes  | List your transactions (filtered, paginated, newest first) |
| GET    | `/transactions/summary` | Yes  | Monthly totals and category breakdown                      |
| POST   | `/transactions`         | Yes  | Create a transaction                                       |
| PUT    | `/transactions/:id`     | Yes  | Update a transaction (send only the fields to change)      |
| DELETE | `/transactions/:id`     | Yes  | Delete a transaction                                       |
| GET    | `/health`               | No   | Health check (outside `/api`)                              |

**Query parameters for `GET /transactions`**

| Parameter   | Description                             | Default |
| ----------- | --------------------------------------- | ------- |
| `type`      | `income` or `expense`                   | all     |
| `category`  | A valid category name                   | all     |
| `startDate` | `YYYY-MM-DD`, inclusive                 | none    |
| `endDate`   | `YYYY-MM-DD`, inclusive (the whole day) | none    |
| `page`      | Page number                             | 1       |
| `limit`     | Items per page, maximum 100             | 10      |

```json
{
  "transactions": [
    {
      "_id": "6540...",
      "type": "expense",
      "amount": 250,
      "category": "Food",
      "date": "2026-10-25T00:00:00.000Z",
      "note": "Lunch"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 19,
  "totalPages": 2
}
```

**`GET /transactions/summary?month=2026-10`** (month defaults to the current month)

```json
{
  "month": "2026-10",
  "totalIncome": 51500,
  "totalExpenses": 18550,
  "balance": 32950,
  "expensesByCategory": [
    { "category": "Bills", "total": 12900, "count": 2 },
    { "category": "Shopping", "total": 2500, "count": 1 }
  ],
  "incomeByCategory": [{ "category": "Salary", "total": 50000, "count": 1 }]
}
```

**Validation rules**

- `type`: `income` or `expense`
- `amount`: a number greater than 0
- `category`: must belong to the selected type
- `date`: `YYYY-MM-DD`, not in the future (defaults to now)
- `note`: optional, at most 100 characters

**Status codes:** `200` OK, `201` created, `400` validation error, `401` missing or invalid token, `404` not found (including other users' transactions), `409` email already registered.

## Getting started locally

**Prerequisites:** Node.js 18 or newer and a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

```bash
git clone https://github.com/<your-username>/expense-tracker.git
cd expense-tracker
```

**1. API**

```bash
cd server
npm install
cp .env.example .env      # on Windows: copy .env.example .env
# edit .env and fill in your values
npm run dev
```

**2. Client** (in a second terminal)

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

### Environment variables

**`server/.env`**

| Variable         | Description                                                              |
| ---------------- | ------------------------------------------------------------------------ |
| `PORT`           | Port for the API (default 5000; Render sets its own)                     |
| `MONGO_URI`      | MongoDB Atlas connection string, including the database name             |
| `JWT_SECRET`     | Long random string used to sign tokens                                   |
| `JWT_EXPIRES_IN` | Token lifetime, for example `7d`                                         |
| `CLIENT_URL`     | Allowed frontend origin(s) for CORS, comma-separated                     |
| `USE_PUBLIC_DNS` | Optional. Set to `true` if `mongodb+srv://` lookups fail on your network |

**`client/.env`**

| Variable       | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| `VITE_API_URL` | Base URL of the API, for example `http://localhost:5000/api` |

## Testing

Two scripts in `server/` exercise the running API:

```bash
node seed-test-data.js     # creates a user with 19 sample transactions and prints the login
node test-ownership.js     # checks that one user cannot read, edit or delete another user's data
```

## Design decisions

- **Ownership on every query.** Each transaction stores its owner, and every read, update and delete filters by the logged-in user's id. Requests for someone else's transaction return `404`, not `403`, so the API doesn't reveal which ids exist.
- **Validation lives on the server.** The form restricts choices for convenience, but the model enforces the rules (category matches type, amount above 0, no future dates), so direct API calls can't bypass them.
- **Aggregation instead of client-side math.** The monthly summary runs as a MongoDB pipeline (`$match`, `$group`, `$sort`), so the server returns a handful of grouped rows no matter how many transactions exist.
- **Whitelisted fields.** Only `type`, `amount`, `category`, `date` and `note` are read from request bodies, so a client can't set the owner or other internal fields.
- **Validated query parameters.** Filter values are checked before they reach the database query.
- **Hardened for production.** CORS is limited to the configured frontend, auth routes are rate limited, security headers come from helmet, and the server refuses to start without its required secrets.

## Known limitations and next steps

- The JWT is stored in `localStorage`. An `httpOnly` cookie would reduce exposure to XSS.
- The interface has no edit form yet, although the API supports updates.
- Automated tests run as scripts; a proper test suite with CI is a next step.
- Possible features: monthly budgets, CSV export, recurring transactions.

## Author

**Tanu Sharma** · [GitHub](https://github.com/TanuSharma2004) · [LinkedIn](https://www.linkedin.com/in/tanu-sharma-885862324)
