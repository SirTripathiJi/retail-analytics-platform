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
