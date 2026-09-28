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
# retail-analytics-platform

Retail-analytics-platform is a inventory management, billing, and business analytics application built for small retail shops. It brings stock tracking, invoice generation, sales history, and performance monitoring into a single clean interface, designed for fast day-to-day operations.

## Overview

The application is structured around the core workflow of a small shop:

- add and manage inventory
- monitor expiry and stock availability
- create bills quickly
- record completed sales
- review transaction history
- track revenue and profit trends
- manage local application data

The current implementation is frontend-first and works with browser storage, making it lightweight, fast, and easy to use without a complex backend setup.

## Key Features

### Inventory Management
- Add new products with product name, category, quantity, expiry date, cost price, and selling price.
- View current stock in a searchable table.
- Track item status with clear labels such as Expired, Near Expiry, and Good.
- Edit or delete existing stock entries.

### Billing System
- Select products from inventory and add them to a bill.
- Enter quantity for each selected item.
- Apply discount and tax values.
- Record payment mode and amount paid.
- Generate a final bill from the built-in billing screen.

### Transactions and Sales History
- View a complete record of generated bills.
- Inspect bill number, date, total, paid amount, due amount, and payment status.
- Filter sales by date.

### Dashboard Overview
- Monitor Total Sales, Net Profit, Items in Stock, and Sales Today.
- Review critical alerts for low stock and expired items.
- See a business health summary with revenue, profit, and profit margin.

### Analytics and Insights
- Visualize sales versus profit trends.
- Review top products by volume.
- Use chart-based insights to understand shop performance more clearly.
- Support for higher-level performance views aligned with profit intelligence and customer insight planning.

### Authentication UI
- Clean login and sign-up screens.
- Separate authentication layout for a focused entry experience.

### Settings and Data Control
- Reset all inventory and sales data from the settings page.
- Access support and contact information from within the app.
- Use the theme toggle available in the top bar for appearance switching.

### Landing Page and Pricing Page
- Public-facing product introduction page.
- Feature highlights and product positioning.
- Feature cards for Inventory Control, Billing Made Simple, Business Insights, and Privacy-First.
- Preview items marked as coming soon for Smart Assistant and Voice Entries.
- Pricing section with Starter at ₹399/month and Pro+ Preview at ₹799/month.
- Clear call-to-action flow for onboarding.

## Application Pages

### 1. Landing Page
The landing page presents the product vision, core benefits, feature blocks, trust points, and pricing information. It is designed to explain the product clearly before login.

### 2. Authentication
The login page provides tabs for Login and Sign Up, keeping the entry flow simple and focused.

### 3. Overview
The overview page acts as the main command center. It summarizes sales, profit, stock, and important alerts in one place.

### 4. Inventory
The inventory page is used to create and manage stock items. It includes an add-product form and a searchable current-stock table.

### 5. Billing
The billing page is used to build bills from inventory items, calculate totals, and generate sales records.

### 6. Transactions
The transactions page shows bill history in a structured table for quick review and follow-up.

### 7. Insights
The insights page shows charts and product-performance analytics for a more visual understanding of the business.

### 8. Settings
The settings page provides app-level data control and support information.

## Project Structure

```text
arthsaathi-web/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── Dashboard_page/
│   │   ├── Billing.jsx
│   │   ├── Card.jsx
│   │   ├── Dashboard.css
│   │   ├── Dashboard.jsx
│   │   ├── Insights.jsx
│   │   ├── Inventory.jsx
│   │   ├── Overview.jsx
│   │   ├── Settings.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Stats.jsx
│   │   ├── Topbar.jsx
│   │   └── Transactions.jsx
│   ├── landing_page/
│   │   ├── App.css
│   │   ├── app.jsx
│   │   ├── Features.jsx
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx
│   │   ├── Highlights.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── Navbar.jsx
│   │   ├── Pricing.jsx
│   │   └── Stats.jsx
│   ├── login_page/
│   │   ├── AuthLayout.jsx
│   │   ├── Login.css
│   │   └── Login.jsx
│   └── utils/
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Technology Stack

- React
- Vite
- CSS
- Browser local storage
- Client-side UI state and component composition

## Data Handling

ArthSaathi is designed as a local-first application. Inventory, billing, and sales-related data are stored in the browser, which allows the app to run quickly and remain usable without a server in the current implementation. The settings page includes a reset action that clears local data.

## Design Goals

- Keep the interface simple and readable.
- Reduce operational friction for small shop owners.
- Make stock, billing, and sales tracking available in one place.
- Present business data in a clean, decision-friendly format.
- Use a minimal visual language with clear spacing, borders, and status indicators.

## Included Screens

- Public landing page
- Login and sign-up page
- Overview dashboard
- Inventory management page
- Billing page
- Transaction history page
- Insights and analytics page
- Settings page

## Future Enhancement Opportunities

- PDF invoice export
- barcode or SKU-based search
- role-based access control
- cloud backup and sync
- advanced reporting filters
- low-stock notifications
- customer and supplier records
- sales forecasting
- audit trail for edits and deletions

## Author

Akshat Tripathi
