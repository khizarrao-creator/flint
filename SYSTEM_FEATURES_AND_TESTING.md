# Flint ERP - System Features & Verification Guide

This document outlines the current feature set of the Flint ERP system and provides step-by-step instructions to test and verify each module.

---

## 1. Super Admin Portal (Multi-Tenancy)
**Goal:** Manage the SaaS infrastructure, provision new tenants, and control access.

### Features:
- **Tenant Provisioning Wizard**: Atomically creates a Tenant, Admin User, and customized Chart of Accounts.
- **Tenant Management**: View, Search, Suspend/Activate, and Delete tenants.
- **System Stats**: View total active instances.

### 🧪 Verification Steps:
1.  **Login**: Access `/login` with Super Admin credentials (e.g., `khizarraoworks@gmail.com`).
2.  **Navigate**: You will be redirected to `/admin` automatically.
    *   *Verify*: You see the "Command Center" dashboard.
3.  **Provision**: Click **"Provision New Instance"**.
    *   Fill in: Organization Name (e.g., "Orbit Tech"), Subdomain (e.g., "orbit"), Admin Email/User/Pass.
    *   Click "Provision".
    *   *Verify*: The new tenant appears in the list.
4.  **Manage**: Click the **Settings (Gear)** icon on a tenant card.
    *   Try changing the name.
    *   Try toggling the "Active" status (Suspended tenants cannot log in).
    *   *Verify*: The changes reflect immediately.

---

## 2. Dynamic Theming & Personalization
**Goal:** Allow tenants to customize the look and feel of their ERP instance to match their brand.

### Features:
- **7 Presets**: Fiery Flint, Oceanic Depths, Royal Violet, Emerald Forest, Crimson Guard, Midas Touch, Midnight Rose.
- **Persistence**: Theme choice is saved to the Cloud (Database) and LocalStorage.

### 🧪 Verification Steps:
1.  **Login**: Log in as a Tenant Admin (e.g., the user you just provisioned).
2.  **Navigate**: Click **"Settings"** in the Sidebar.
3.  **Action**: Click on a theme card (e.g., **"Emerald Forest"**).
    *   *Verify*: The entire application (buttons, borders, sidebar accents) turns Green instantly.
4.  **Persistence**: Reload the page (F5).
    *   *Verify*: The Green theme remains active.

---

## 3. Core ERP (Order to Cash)
**Goal:** Manage day-to-day business operations including inventory, sales, and financial tracking.

### Features:
- **Inventory Engine**: Real-time stock deduction.
- **Order Management**: Create orders with products, tax, and discounts.
- **Financial Ledger**: Automatic Double-Entry bookkeeping (Debit AR / Credit Revenue) upon order creation.

### 🧪 Verification Steps:
1.  **Products**: Go to **Products** -> Add a new Product (Name, Price: $100, Stock: 10).
2.  **Customers**: Go to **Customers** -> Add a new Customer.
3.  **Order**: Go to **Orders** -> Create New Order.
    *   Select the Customer and Product.
    *   Set Quantity: 2.
    *   Save.
    *   *Verify*: Product stock is now 8.
4.  **Finances**: Go to **Finances**.
    *   *Verify*: "Total Revenue" increased by $200.
    *   *Verify*: The "Global Ledger" shows a new transaction pair (Debit/Credit).

---

## 4. Customer Portal (Self-Service)
**Goal:** Provide end-customers with a portal to view their billing history and balance.

### Features:
- **Secure Access**: Dedicated login for Customers (not Users).
- **Dashboard**: Real-time balance view.
- **My Orders**: Filtered list of orders for that specific customer.

### 🧪 Verification Steps:
1.  **Enable Access (As Admin)**:
    *   Go to **Customers**.
    *   Edit a Customer.
    *   Toggle **"Portal Access"** ON.
    *   Click **"Generate Random"** for password (copy this!).
    *   Save.
2.  **Login (As Customer)**:
    *   Go to `/portal/login` (or click link on main login page).
    *   Enter:
        *   **Org ID**: Your Tenant Subdomain (e.g., `orbit`).
        *   **Email**: Customer's email.
        *   **Password**: The generated password.
3.  **Verify**:
    *   You are logged in to the **Portal Dashboard**.
    *   Check **"Current Balance"** (Should match the Admin's "Ledger Balance" for this customer).
    *   Check **"Recent Orders"** (Should show the order you created in Step 3).    

---

## 5.- [x] Multi-tenant Architecture
- [x] Authentication (JWT)
- [x] Product Management
- [x] Order Management (Sales & Purchases)
- [x] DocType Workflow (System & Custom)
- [x] Financial Integration (AP/AR/GL)
- [x] Financial Reports (BS & P&L)
- [x] Manufacturing (BOM & Work Orders)
- [x] Purchasing (PO Management)
- [x] Inventory (Stock Levels)
- [x] Asset Management (Registry)
- [x] RBAC: Customers cannot access Admin APIs; Users cannot access Super Admin APIs.
