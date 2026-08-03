# Banking App

A full-stack banking dashboard built with Next.js. Users sign up, securely link their real bank
accounts through Plaid, and get a single place to see balances across every connected bank, browse
transaction history, and send money between accounts via Dwolla's ACH network.

## Live Demo

**[View the live site](https://banking-app-khaki-xi.vercel.app/)**

## What It Does

- **Authentication** — Email/password sign-up and sign-in backed by Appwrite, with server-side
  sessions stored in HTTP-only cookies.
- **Connect real banks** — Plaid Link handles the bank login flow; connected accounts are exchanged
  for access tokens and saved to the user's profile.
- **Unified dashboard** — Total balance across all linked banks, a spending-by-category doughnut
  chart, and the most recent transactions at a glance.
- **My Banks** — Every linked account rendered as a card with its masked account number and balance.
- **Transaction history** — Per-account transaction table with pagination and category badges.
- **Payment transfers** — Move funds between accounts using Dwolla, with the recipient looked up by
  their shareable ID.
- **Error monitoring** — Sentry is wired into the client, server, and edge runtimes.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Actions) |
| Language | TypeScript |
| UI | React 19, [Tailwind CSS](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com), Base UI |
| Forms & validation | React Hook Form + [Zod](https://zod.dev) |
| Charts | Chart.js via react-chartjs-2 |
| Auth & database | [Appwrite](https://appwrite.io) |
| Bank connections | [Plaid](https://plaid.com) |
| Payments / ACH transfers | [Dwolla](https://www.dwolla.com) |
| Monitoring | [Sentry](https://sentry.io) |
| Hosting | [Vercel](https://vercel.com) |

## Project Structure

```
app/
  (auth)/            Sign-in and sign-up routes
  (root)/            Dashboard, my-banks, payment-transfer, transaction-history
components/          Feature components (BankCard, PlaidLink, DoughnutChart, …)
  ui/                shadcn/ui primitives
lib/
  actions/           Server actions for users, banks, transactions, Dwolla
  appwrite.ts        Appwrite server/client setup
  plaid.ts           Plaid client setup
  utils.ts           Formatting and helper functions
constants/           Sidebar links, category styles, and other static data
types/               Global TypeScript declarations
```

## Getting Started

### Prerequisites

You'll need free developer accounts for [Appwrite](https://appwrite.io),
[Plaid](https://dashboard.plaid.com/signup) (sandbox), and
[Dwolla](https://accounts-sandbox.dwolla.com/login) (sandbox).

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env

# 3. Fill in .env with your own keys (see below), then start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Copy `.env.example` to `.env` and fill in each value:

| Variable | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` in development |
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Appwrite console (defaults to Appwrite Cloud) |
| `NEXT_PUBLIC_APPWRITE_PROJECT` | Appwrite project ID |
| `APPWRITE_DATABASE_ID` | Appwrite database ID |
| `APPWRITE_USER_COLLECTION_ID` | Appwrite collection storing users |
| `APPWRITE_BANK_COLLECTION_ID` | Appwrite collection storing linked banks |
| `APPWRITE_TRANSACTION_COLLECTION_ID` | Appwrite collection storing transfers |
| `NEXT_APPWRITE_KEY` | Appwrite server API key |
| `PLAID_CLIENT_ID` / `PLAID_SECRET` | Plaid dashboard → Keys |
| `PLAID_ENV` | `sandbox` for development |
| `PLAID_PRODUCTS` / `PLAID_COUNTRY_CODES` | e.g. `auth,transactions` and `US,CA` |
| `DWOLLA_KEY` / `DWOLLA_SECRET` | Dwolla sandbox dashboard |
| `DWOLLA_BASE_URL` / `DWOLLA_ENV` | `https://api-sandbox.dwolla.com` and `sandbox` |

> `.env` is gitignored — never commit real credentials.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Deployment

The app is deployed on Vercel. Add every variable from `.env.example` to your project's
**Settings → Environment Variables** in the Vercel dashboard, then push to `main` to trigger a
deploy. Remember to update `NEXT_PUBLIC_SITE_URL` to your production domain.
