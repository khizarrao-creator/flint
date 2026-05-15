# Flint: Core Database Schema (Professional V4)

## 🏛️ Schema Architecture
This schema is designed to be **intuitive but comprehensive**, balancing readable naming conventions with the complex relational depth required for a commercial ERP.

---

## 1. Multi-Tenancy & Foundation
Every table in this schema supports multi-tenancy via `tenant_id` to ensure data isolation.

```sql
-- The root of the SaaS
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(64) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Global Flag System (For statuses, tags, and workflow markers)
CREATE TABLE flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    entity_type VARCHAR(50) NOT NULL, -- e.g., 'order', 'product', 'customer'
    name VARCHAR(50) NOT NULL, -- e.g., 'Priority', 'Backordered', 'VIP'
    color_code VARCHAR(7) DEFAULT '#808080',
    icon_key VARCHAR(50),
    UNIQUE(tenant_id, entity_type, name)
);
```

---

## 2. Product & Category Management
A hierarchical approach to inventory allows for deep categorization and intelligent stock tracking.

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL, -- Self-referencing for hierarchy
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    category_id UUID REFERENCES categories(id),
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(19,4) NOT NULL DEFAULT 0.00,
    cost_price DECIMAL(19,4) NOT NULL DEFAULT 0.00,
    stock_quantity DECIMAL(19,4) DEFAULT 0.00,
    min_stock_level DECIMAL(19,4) DEFAULT 0.00,
    weight_unit VARCHAR(10) DEFAULT 'kg',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, sku)
);
```

---

## 3. CRM (Customers)
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    billing_address TEXT,
    shipping_address TEXT,
    ledger_balance DECIMAL(19,4) DEFAULT 0.00, -- Current outstanding amount
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);
```

---

## 4. Sales & Orders (The Revenue Engine)
Using distinct tables for order headers and line-item products allows for complex transaction tracking.

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    customer_id UUID REFERENCES customers(id),
    order_number VARCHAR(50) NOT NULL, -- Human-readable ID (e.g., ORD-1001)
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Processing, Shipped, Delivered, Cancelled
    total_amount DECIMAL(19,4) DEFAULT 0.00,
    tax_amount DECIMAL(19,4) DEFAULT 0.00,
    discount_amount DECIMAL(19,4) DEFAULT 0.00,
    shipping_cost DECIMAL(19,4) DEFAULT 0.00,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date DATE,
    notes TEXT,
    created_by UUID, -- Link to user_id
    UNIQUE(tenant_id, order_number)
);

-- Junction table for products in an order
CREATE TABLE order_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity DECIMAL(19,4) NOT NULL,
    unit_price DECIMAL(19,4) NOT NULL, -- Price at time of purchase
    discount DECIMAL(19,4) DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    subtotal DECIMAL(19,4) GENERATED ALWAYS AS (quantity * (unit_price - discount)) STORED
);
```

---

## 5. Finance & Accounts
This section manages the money flow, linking business actions to financial records.

```sql
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL, -- e.g., 'Main Bank Account', 'Petty Cash'
    account_type VARCHAR(50) NOT NULL, -- Asset, Liability, Revenue, Expense
    account_code VARCHAR(20), -- e.g., '1010'
    balance DECIMAL(19,4) DEFAULT 0.00,
    currency CHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Transactions (Ledger)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    account_id UUID REFERENCES accounts(id),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- Link payment to order
    amount DECIMAL(19,4) NOT NULL,
    type VARCHAR(10) NOT NULL, -- 'Credit' or 'Debit'
    description TEXT,
    reference_number VARCHAR(100),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔗 Key Relationships Explained

1.  **Orders & Customers**: Every order belongs to one customer. A customer can have many orders (`customers.id` -> `orders.customer_id`).
2.  **Orders & Order_Products**: Standard parent-child relationship. One order has many items (`orders.id` -> `order_products.order_id`).
3.  **Products & Categories**: Products are organized under a category hierarchy for nested lists (`categories.id` -> `products.category_id`).
4.  **Flags & Everything**: The `flags` table is a generic metadata system. An order can be "flagged" as "High Priority" by storing a reference in a separate mapping table or as a status key.
5.  **Accounts & Transactions**: Financial moves are recorded in the `transactions` table, which subtracts or adds to the `accounts.balance`.

---

## 💎 Wisdom Features (The "Professional" Touch)

| Feature | Justification |
| :--- | :--- |
| **`DECIMAL(19,4)`** | Standard float types lose precision in money. This is a "wise" choice for financial accuracy. |
| **Generative Subtotals** | `order_products.subtotal` is a stored calculated column, reducing API logic and ensuring DB-level truth. |
| **Hierarchical Categories** | The `parent_id` in categories allows for "Electronics > Computers > Laptops" nesting. |
| **Ledger Balance** | `customers.ledger_balance` provides an instant snapshot of credit/debt without re-calculating thousands of orders. |
| **Lexicographical Naming** | Names like `order_products` (parent_child) make reading SQL joins natural and semi-documented. |
| **Reference Numbers** | Every financial and order record has a `reference_number` or `order_number` to match paper/external documents. |

---

## 📈 Scalability Note
For a system scaling to thousands of tenants, ensure:
- **Indexes** exist on all `tenant_id` columns.
- **Indexes** exist on `sku`, `order_number`, and `email` for fast lookups.
- **Audit Logs**: (Not shown here but implemented in [Security]) track who changed what in these tables.
