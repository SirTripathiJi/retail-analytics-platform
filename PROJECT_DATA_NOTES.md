# Current data model and backend boundary

## Existing frontend data

The React app stores records in browser `localStorage` through
`frontend/src/services/db.js`. Records are separated by the locally signed-in
user ID, but the user and password records are also in that same browser
storage; this is a local demo login, not secure authentication.

- **Product** (`as_p_<uid>`): `id`, `name`, `category`, `cost`, `sell`,
  `quantity`, `low_stock_threshold`, and `expiry_date`. `db.js` maps older
  `qty`, `expiry`, and `lowStock` names to the current quantity/date/threshold
  properties when it reads a product.
- **Sale/invoice** (`as_s_<uid>`): `id` (normally `INV-` plus a sequential
  number), `date`, `customerId`, `customerName`, `customerPhone`, `items`,
  `subtotal`, `discount`, `discountPercent`, `tax`, `taxPercent`, `total`,
  `paid`, `due`, `paymentMethod`, `status`, `profit`, `notes`, and
  `_createdAt`. Sale items retain `id`, `name`, `qty`, `rate`, `cost`, and
  `isCustom` at the time of sale. Legacy one-item records are upgraded in
  memory by `DB.getSales` when read.
- **Customer** (`as_c_<uid>`): `id`, `name`, `phone`, `address`, `notes`,
  and `createdAt`.
- **User/session** (`as_users`, `as_session`): local user identity and
  plaintext password, plus the currently active local session.

Inventory form validation currently requires a name, nonnegative cost and
quantity, positive selling price, and a case-insensitive unique product name
(`Inventory.handleSave`). The shared `shared/invoice.js` calculation computes
subtotal, percentage discount, tax after discount, paid, due, and payment
status for both the React preview and Express validation. `DataContext.confirmSale`
calls `POST /api/sales`; Express re-reads product cost/quantity, recalculates
the bill, rejects overpayment/insufficient stock, snapshots each line, and
updates stock with the sale. Customer due settlement is still handled by the
older browser-local `DataContext.settleCustomerDues` flow and is not yet a
server operation.

## Recommended API boundary

React pages continue using `DataContext`, which calls
`frontend/src/services/api.js`; Express validates and owns inventory writes
and sale creation. The API uses in-memory product/sale storage by default;
records reset when the API process restarts. If `MONGODB_URI` is configured,
the server uses `products` and `sales` MongoDB collections. That integration
has mock adapter tests but has not been verified with a live MongoDB instance.
The API has no authentication or user/store isolation and is suitable only
for local development.

Example product request:

```json
{
  "name": "Tea",
  "category": "Grocery",
  "cost": 30,
  "sell": 45,
  "quantity": 12,
  "low_stock_threshold": 5,
  "expiry_date": "2027-01-01"
}
```

The API returns the saved product with a server-assigned `id`. Invalid input
uses a JSON error response such as `{"error":{"code":"VALIDATION_ERROR","message":"Selling price must be greater than zero"}}`.

## MongoDB collections and future collections

- `products` (**implemented, Mongo mode only**): name, category, cost, sell,
  quantity, low-stock threshold and expiry date. Shop ownership and timestamps
  are not implemented.
- `sales` (**implemented, Mongo mode only**): invoice number, sale date,
  customer snapshot, line items, subtotal, discount, tax, total, paid, due,
  payment status, profit, and notes. Each line item snapshots product name,
  quantity, unit selling price and unit cost at sale time. Shop ownership and
  payment-event history are not implemented.
- `customers` (**future**): shop ownership, contact fields, notes and
  timestamps.
- `users` (**future**): normalized email and password hash, with access
  controls tied to a shop/store. Never store plaintext passwords.

The Mongo sales collection and stock change use a driver transaction. The
configured MongoDB deployment must support transactions (normally a replica
set or sharded cluster); otherwise sale creation fails with a clear 503 error
instead of writing a bill and stock change separately. Only a mock adapter
test is available here, so real replica-set support remains unverified.
