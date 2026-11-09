# Retail Analytics Platform: Database Normalization

## 1. Scope and current data model

This document models the retail shop application in `SirTripathiJi/retail-analytics-platform`. `SirTripathiJi/DE_Project_2026` is used as a reference for documenting entities, keys, functional dependencies and normalization decisions. Its Practo appointment schema is a separate domain and is not copied into this design.

The application currently stores products, sales, customers and local demo users in browser `localStorage`. Its optional backend stores products and sales in MongoDB documents (or in memory); it does not currently use relational tables. The relational relations below are a normalization design for the app's business data, not a description of a deployed SQL database. Customer and user records are not yet served by the backend. Password storage in the current local demo is outside this business schema and should not be treated as production authentication.

The model covers inventory, invoices, invoice lines, customers and payment recording. Product fields observed in the app include `name`, `category`, `cost`, `sell`, `quantity`, `low_stock_threshold` and `expiry_date`. Sales include invoice/date, customer details, line items, subtotal, discount, tax, total, paid, due, payment method, status, profit and notes. Customer profiles include name, phone, address and notes. The sale line stores a snapshot of item name, quantity, unit selling price, unit cost and whether it is a custom (non-inventory) item.

## 2. Business rules and assumptions

- Each product has one current stock quantity, cost, selling price, category, low-stock threshold and optional expiry date. The app does not currently model multiple lots or stock movements.
- A sale has one or more sale lines and at most one selected customer. A walk-in sale may have no customer record.
- A sale line may reference an inventory product or represent a custom item that is not in inventory. Its sold name and prices are retained as a historical snapshot.
- The current app records one payment method and paid amount on a sale. Customer due settlement is handled in browser state; a durable payment-event history is not implemented. A `Payment` relation is recommended if partial/multiple settlements must be retained.
- `subtotal`, `discount`, `tax`, `total`, `paid`, `due`, `status` and `profit` are calculated or maintained from sale data. They may be stored as an invoice snapshot for display/reproducibility, but should be validated against line and payment details.
- Product names are currently constrained to be unique without regard to case in the API store. A relational implementation should enforce uniqueness on a normalized name within the shop.
- This app has no shop ownership or server-side user isolation today. A production multi-shop schema should include `shop_id` on each shop-owned entity and scope keys/uniqueness accordingly.

## 3. Unnormalized form (UNF)

A single invoice record with a repeating `items` group is not a normalized relational table:

```text
INVOICE_UNF(
  invoice_id, date, customer_id, customer_name, customer_phone,
  items[{product_id, item_name, qty, unit_price, unit_cost, is_custom}],
  subtotal, discount_percent, discount_amount, tax_percent, tax_amount,
  total, paid, due, payment_method, status, profit, notes
)
```

The `items` array contains a variable number of values, so invoice item attributes are not scalar columns in this representation. Repeating product/customer details in each invoice can also create update anomalies. The current MongoDB document intentionally embeds these line items; the relational design below separates them.

## 4. First Normal Form (1NF)

**Requirement:** each column contains one atomic value, and each row represents one record. Split the repeating invoice item group into one row per item. A flat 1NF staging relation can be written as:

```text
SALE_LINE_1NF(
  invoice_id, line_no, sale_date,
  customer_id, customer_name, customer_phone,
  product_id, item_name, qty, unit_price, unit_cost, is_custom,
  subtotal, discount_percent, discount_amount, tax_percent, tax_amount,
  total, paid, due, payment_method, status, profit, notes
)
PK: (invoice_id, line_no)
```

Each invoice line now occupies its own row; no `items[]` array remains in the relational table. A sale with three items has three rows. Sale-level values repeat on each row, however, and product/customer facts still appear alongside transaction facts. Therefore this relation is 1NF but not 2NF.

## 5. Second Normal Form (2NF)

**Requirement:** be in 1NF and have every non-key attribute depend on the whole candidate key. In `SALE_LINE_1NF`, the key is composite `(invoice_id, line_no)`. Invoice date, customer and payment fields depend only on `invoice_id`; they do not depend on `line_no`. Split those partial dependencies into invoice header and line relations:

```text
SALE(
  sale_id PK,
  invoice_number UNIQUE,
  sold_at,
  customer_id FK NULL,
  customer_name_snapshot,
  customer_phone_snapshot,
  discount_percent,
  tax_percent,
  payment_method,
  notes
)

SALE_ITEM(
  sale_id FK,
  line_no,
  product_id FK NULL,
  item_name_snapshot,
  qty,
  unit_selling_price,
  unit_cost_snapshot,
  is_custom,
  PK (sale_id, line_no)
)
```

The line key identifies a line even when it is a custom item with no `product_id`. Product values such as current category and stock do not belong in the sale line as authoritative product facts; only historical line snapshots belong there. `SALE` and `SALE_ITEM` remove the partial dependency of header attributes on the composite line key. They are also in 3NF under the dependencies described next, subject to the deliberate invoice snapshot fields.

## 6. Third Normal Form (3NF)

**Requirement:** be in 2NF and have no non-key attribute depend transitively on a key through another non-key attribute. Keep customer profile data and product master data in their own relations, rather than copying them as current facts into every invoice:

```text
CUSTOMER(
  customer_id PK,
  name,
  phone,
  address,
  notes,
  created_at
)

PRODUCT(
  product_id PK,
  name,
  category,
  cost_price,
  selling_price,
  quantity_on_hand,
  low_stock_threshold,
  expiry_date
)
```

`SALE.customer_id` references `CUSTOMER.customer_id`; `SALE_ITEM.product_id` references `PRODUCT.product_id` for inventory items and is NULL for custom items. Product and customer attributes are no longer stored as current facts on each invoice. This avoids update anomalies when a customer address or product price changes.

The app also retains `customer_name_snapshot`, `customer_phone_snapshot`, `item_name_snapshot`, `unit_selling_price` and `unit_cost_snapshot` on sale records/lines. These values intentionally describe what appeared on the historical invoice at sale time; they are snapshots, not competing current master data. A customer may be absent (walk-in), and a product may later be renamed or removed, so relying only on a live join would alter or lose historical invoices. Keep snapshots only for that historical purpose and never use them to update master records.

If category names need controlled spelling or metadata, normalize them into a lookup relation:

```text
CATEGORY(category_id PK, category_name UNIQUE)
PRODUCT(product_id PK, ..., category_id FK, ...)
```

The current app treats category as a text value and has no category-management entity, so this lookup is an optional extension rather than an existing table.

For payment history beyond one current payment summary per sale, use:

```text
PAYMENT(
  payment_id PK,
  sale_id FK,
  paid_at,
  amount,
  method
)
```

Then calculate `paid` as the sum of a sale's payment events and `due` as the remaining balance. This is a recommended extension: the current implementation does not persist a payment-event relation.

## 7. Boyce–Codd Normal Form (BCNF)

**Requirement:** for every non-trivial functional dependency `X → Y`, `X` must be a superkey. Under the stated rules, the core relations can satisfy BCNF:

| Relation | Functional dependencies / candidate keys | BCNF rationale |
|---|---|---|
| `CUSTOMER` | `customer_id → name, phone, address, notes, created_at`; optionally `phone → customer_id, ...` only if phone is enforced unique per shop | Every determinant is a candidate key. Phone uniqueness is not currently enforced by the app, so do not assume it without a business rule. |
| `PRODUCT` | `product_id → name, category, cost_price, selling_price, quantity_on_hand, low_stock_threshold, expiry_date`; normalized product name is unique per shop | Product ID and the enforced normalized-name key are candidate keys. |
| `SALE` | `sale_id → invoice_number, sold_at, customer_id, snapshots, discount/tax inputs, payment_method, notes`; `invoice_number → sale_id, ...` | `sale_id` and unique invoice number are candidate keys. |
| `SALE_ITEM` | `(sale_id, line_no) → product_id, snapshots, qty, prices, is_custom` | The composite primary key is the determinant and candidate key. |
| `PAYMENT` (optional) | `payment_id → sale_id, paid_at, amount, method` | `payment_id` is the determinant and candidate key. |
| `CATEGORY` (optional) | `category_id → category_name`; `category_name → category_id` if unique | Both determinants are candidate keys when category names are unique. |

For multi-shop use, uniqueness should generally be `(shop_id, normalized_product_name)` and `(shop_id, invoice_number)`, while each entity retains its own surrogate primary key. A `shop_id` column by itself does not determine every other attribute; the composite candidate keys preserve BCNF.

## 8. Derived values and integrity constraints

The following values are derived and should be computed or checked consistently:

- `line_amount = qty × unit_selling_price`.
- `subtotal = sum(line_amount)`.
- Discount and tax amounts follow the app's invoice calculation rules and configured percentages.
- `paid` is the recorded payment total; `due = total − paid` (not below zero under current validation).
- Payment status is derived from total, paid and due.
- Profit uses the historical unit cost snapshot and line quantity, adjusted according to the invoice calculation rules.
- Product stock decreases when an inventory product is sold; custom items do not affect inventory stock.

Use non-negative checks for quantity, cost, threshold and payment amount; positive checks for selling price and sale-line quantity/price; percentage bounds of 0–100; foreign keys for customer, product and sale references; and a check that a custom line has no inventory product reference (or explicitly define how both fields coexist). Keep sale creation and stock changes in one transaction so the invoice cannot be saved without the matching inventory update.

## 9. Normalized relational design summary

```text
CUSTOMER 1 ─── * SALE 1 ─── * SALE_ITEM * ─── 0..1 PRODUCT
                       └── * PAYMENT (optional payment history)
PRODUCT * ─── 0..1 CATEGORY (optional category lookup)
```

The result removes repeating groups (1NF), separates invoice-level facts from composite-key line facts (2NF), and separates customer and product master data from transaction facts (3NF). The core relations meet BCNF when the stated candidate-key constraints are enforced. Historical invoice snapshots are retained intentionally to preserve the receipt as it was issued.

## 10. Reference material

- `DE_Project_2026/docs/02_schema_design.md` and `DE_Project_2026/sql/01_schema.sql` informed the documentation structure and key/functional-dependency analysis.
- `retail-analytics-platform/PROJECT_DATA_NOTES.md`, `backend/src/sales/buildSale.js`, `backend/src/products/router.js` and `frontend/src/services/db.js` describe the current retail app records and behavior.
