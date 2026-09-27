# Retail Analytics Platform

A React/Vite shop-management frontend with an Express API. Inventory CRUD
and bill creation now go through the API. Without a configured MongoDB URI,
the API uses **temporary in-memory storage**, which is lost when the backend
restarts. MongoDB persistence is optional and implemented for products and
sales, but has not been verified against a live database. Customers and local
user accounts still use browser `localStorage`; login is not real secure
authentication.

## Requirements

- Node.js 24.10.0 was used for verification. Use a current Node release
  compatible with Vite 8.
- npm, installed with Node.js.

There is no root `package.json`; run each set of commands from its own folder.

## Install dependencies

```sh
cd frontend
npm install
```

In a second terminal:

```sh
cd backend
npm install
```

## Configure and run locally

The defaults are `http://127.0.0.1:3001` for Express and `/api` for the
frontend. The Vite development server forwards `/api` requests to Express.
Copy the backend environment template if you want to configure it (the
defaults work without a `.env` file):

```sh
cd backend
cp .env.example .env
```

Leave `MONGODB_URI` blank for temporary in-memory storage. To use MongoDB,
set it to a connection string in the ignored `backend/.env` file and choose
`MONGODB_DATABASE`. Never put database credentials in frontend environment
variables. Start the backend first:

```sh
cd backend
npm run dev
```

Then start the frontend in another terminal:

```sh
cd frontend
cp .env.example .env.local
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). You
can check the backend directly at `http://127.0.0.1:3001/api/health`.

Node loads the optional backend `.env` file in these scripts. Set `PORT` and
`FRONTEND_ORIGIN` there to change local settings. Set `VITE_API_BASE_URL` in
the frontend `.env.local` to
the API base path or URL, and `VITE_API_PROXY_TARGET` to change the Vite
development proxy target. `frontend/.env.example` contains local examples.
Never put secrets in `VITE_*` variables because those values are included in
browser code.

## Checks

Run from `frontend/`:

```sh
npm test
npm run lint
npm run build
```

Run from `backend/`:

```sh
npm test
```

The backend tests start an HTTP server on an ephemeral loopback port and
exercise health, product CRUD, validation, duplicates, sale calculations,
stock deduction/rejection, and concurrent oversell protection. Mocked Mongo
adapter tests check repository calls and that unsupported transactions fail
closed; they do not substitute for a live MongoDB test. The frontend tests
cover invoice totals, partial payment status, customer due settlement,
product storage normalization, and legacy sale migration.

## Current API

- `GET /api/health` → `{ "status": "ok" }`
- `GET /api/products` → `{ "products": [...] }`
- `GET /api/products/:id` → `{ "product": {...} }`
- `POST /api/products` → `201 { "product": {...} }`
- `PUT /api/products/:id` → `{ "product": {...} }`
- `DELETE /api/products/:id` → `204 No Content`
- `GET /api/sales` → `{ "sales": [...] }`
- `POST /api/sales` → `201 { "sale": {...} }`

Product errors use `{ "error": { "code": "...", "message": "..." } }`.
The API validates names, numeric prices/quantity/threshold, expiry dates,
duplicate names, and missing IDs. It has no authentication or shop-level
isolation and must only be used locally in its current form.

Sale creation recalculates totals on the server using the same pure
calculation module as the frontend preview. It validates quantities,
discount, tax, payment amount and required customer information for unpaid
bills. It snapshots product name, selling rate and stored cost on invoice
lines. In-memory sales and stock changes are serialized within one Node
process to prevent concurrent requests selling the same final item. With
MongoDB configured, sale creation uses a MongoDB multi-document transaction;
it returns `503 TRANSACTIONS_REQUIRED` if the database deployment does not
support transactions (for example, a standalone server). No real MongoDB
deployment was available here to verify transaction support.

The API/data boundary and proposed MongoDB collections are described in
[PROJECT_DATA_NOTES.md](PROJECT_DATA_NOTES.md). Existing local inventory is
not automatically imported into the API. Its records remain in each
browser's `localStorage`, but the connected inventory page displays API
records. Existing local sales remain available and new API sales are cached
locally by the frontend. Customer records and due settlements are still
browser-owned. Before relying on this change with existing shop data, export
or back up browser data and plan a verified migration. In-memory API records
disappear when the backend restarts.

## Not implemented yet

- MongoDB persistence has code but is not live-verified; migration/import/export
  and users/customers APIs are not implemented.
- Real authentication/authorization or per-shop data isolation.
- Server-side customer due settlement and payment-event history.
- Automated browser/UI testing and production deployment configuration.

Do not use the current local login or in-memory API to protect or retain real
shop data.
