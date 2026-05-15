# ERP System - Database Schema Relationships

## Core Entity Relationships

```
┌──────────────────────────────────────────────────────────────────┐
│                         TENANT                                    │
│  - Multi-tenant isolation                                        │
│  - Subscription management                                       │
└────────────┬─────────────────────────────────────────────────────┘
             │
             │ All entities belong to a tenant
             │
    ┌────────┴────────────────────────────────────────────┐
    │                                                      │
    ▼                                                      ▼
┌────────────────┐                                   ┌────────────────┐
│   WAREHOUSE    │◄──────────────────────────────────│    PRODUCT     │
│  - Location    │                                   │  - SKU/Code    │
│  - Capacity    │                                   │  - Pricing     │
└────────┬───────┘                                   └────────┬───────┘
         │                                                    │
         │                                                    │
         │                                                    │
    ┌────┴────┐                                          ┌───┴────┐
    │         │                                          │        │
    ▼         ▼                                          ▼        ▼
┌─────────┐ ┌──────────┐                         ┌─────────┐ ┌────────┐
│STOCK    │ │WORK      │                         │CATEGORY │ │FORMULA │
│ITEM     │ │ORDER     │                         │         │ │(BOM)   │
│- Batch  │ │- Status  │                         │         │ │        │
│- Serial │ │- Priority│                         │         │ │        │
└─────────┘ └─────┬────┘                         └─────────┘ └───┬────┘
                  │                                              │
                  │ References                                   │
                  │                                              │
                  └──────────────────┬───────────────────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │FORMULA       │
                              │  - Output    │
                              │  - Batch Size│
                              │  - Yield %   │
                              └──────┬───────┘
                                     │
                                     │ Contains
                                     │
                                     ▼
                              ┌──────────────┐
                              │FORMULA ITEM  │
                              │  - Component │
                              │  - Quantity  │
                              │  - Sequence  │
                              └──────────────┘
```

## Manufacturing Flow

```
PRODUCT (Raw Materials)
    │
    │ Used in
    ▼
FORMULA (Bill of Materials)
    │
    │ Contains sequence of
    ▼
FORMULA ITEMS (Components + Quantities)
    │
    │ Used to create
    ▼
WORK ORDER (Production Instruction)
    │
    │ Transforms materials at
    ▼
WAREHOUSE (Production Location)
    │
    │ Produces
    ▼
PRODUCT (Finished Goods)
```

## Order Management Flow

```
CUSTOMER
    │
    │ Places
    ▼
QUOTATION (Optional)
    │
    │ Converts to
    ▼
SALES ORDER
    │
    ├──► ORDER ITEMS (Product + Quantity)
    │
    ├──► INVOICE (Billing)
    │      │
    │      └──► PAYMENT
    │
    └──► DELIVERY NOTE (Fulfillment)
           │
           └──► Stock Movement (from Warehouse)
```

## Inventory Tracking

```
PRODUCT (Master Data)
    │
    └──► STOCK ITEM (per Warehouse)
           │
           ├──► Batch Number
           ├──► Serial Number
           ├──► Expiry Date
           │
           └──► STOCK MOVEMENT (History)
                  │
                  ├──► Purchase
                  ├──► Sale
                  ├──► Transfer
                  ├──► Adjustment
                  └──► Manufacturing
```

## Financial Integration

```
TRANSACTION (Journal Entry)
    │
    ├──► ACCOUNT (Chart of Accounts)
    │
    ├──► Related to:
    │      ├──► INVOICE
    │      ├──► PAYMENT
    │      ├──► EXPENSE
    │      └──► ASSET DEPRECIATION
    │
    └──► JOURNAL (Grouping)
```

## Asset Management

```
ASSET CATEGORY
    │
    └──► ASSET
           │
           ├──► ASSET ALLOCATION (Who's using it)
           ├──► ASSET MAINTENANCE (Service history)
           └──► ASSET DEPRECIATION (Value tracking)
```

## Key Unique Constraints

| Entity | Unique Fields | Purpose |
|--------|---------------|---------|
| Product | tenantId + sku | Prevent duplicate SKUs per tenant |
| Product | tenantId + code | Enforce unique internal codes |
| Product | barcode | Global barcode uniqueness |
| Formula | productId | One active BOM per product |
| WorkOrder | tenantId + code | Unique work order numbers |
| Customer | tenantId + code | Unique customer codes |
| Warehouse | tenantId + code | Unique warehouse codes |

## Foreign Key Relationships

### Product Module
```typescript
Product {
  tenantId → Tenant.id
  categoryId → Category.id (optional)
  brandId → Brand.id (optional)
  uomId → UnitOfMeasure.id (optional)
  taxRateId → TaxRate.id (optional)
}
```

### Manufacturing Module
```typescript
Formula {
  tenantId → Tenant.id
  productId → Product.id (unique - one BOM per product)
}

FormulaItem {
  tenantId → Tenant.id
  formulaId → Formula.id
  productId → Product.id (component)
  uomId → UnitOfMeasure.id (optional)
}

WorkOrder {
  tenantId → Tenant.id
  formulaId → Formula.id
  warehouseId → Warehouse.id
  assignedToId → User.id (optional)
  createdById → User.id (optional)
}
```

### Order Module
```typescript
SalesOrder {
  tenantId → Tenant.id
  customerId → Customer.id
  warehouseId → Warehouse.id (optional)
  docTypeId → DocType.id (optional)
  quotationId → Quotation.id (optional)
  paymentTermId → PaymentTerm.id (optional)
  shippingMethodId → ShippingMethod.id (optional)
}

OrderItem {
  tenantId → Tenant.id
  salesOrderId → SalesOrder.id (optional)
  purchaseOrderId → PurchaseOrder.id (optional)
  quotationId → Quotation.id (optional)
  productId → Product.id
}
```

## Index Strategy

### High-Traffic Queries
- `Product`: Indexed on `tenantId + isActive`, `tenantId + categoryId`, `sku`
- `StockItem`: Indexed on `tenantId + warehouseId`, `expiryDate`, `sku`
- `WorkOrder`: Indexed on `tenantId + status`, `plannedStart`, `assignedToId`
- `Transaction`: Indexed on `tenantId + transactionDate`, `accountId`

### Composite Indexes
- `@@unique([tenantId, code])` - Ensures code uniqueness per tenant
- `@@unique([tenantId, sku])` - Prevents SKU duplication
- `@@unique([tenantId, productId, warehouseId])` - Stock item location

## Data Flow: Creating a Work Order

```
┌────────────────────────────────────────────────────────┐
│ 1. USER INPUT (NewWorkOrderModal)                      │
│    - Select Product                                    │
│    - Select Formula (automatic based on product)       │
│    - Enter Quantity                                    │
│    - Select Warehouse (or auto-select first active)   │
│    - Set Priority                                      │
│    - Add Notes                                         │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ 2. FRONTEND VALIDATION                                 │
│    - Required fields check                            │
│    - Formula exists for product                       │
│    - Warehouse selected or available                  │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ 3. API REQUEST                                         │
│    POST /manufacturing/work-orders                    │
│    {                                                   │
│      bomId: "formula-uuid",     // maps to formulaId  │
│      quantity: 100,                                    │
│      warehouseId: "warehouse-uuid",                   │
│      priority: 3,               // maps to "NORMAL"   │
│      notes: "...",                                     │
│      startDate: "2026-02-10",   // maps to DateTime   │
│      dueDate: "2026-02-15"      // maps to DateTime   │
│    }                                                   │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ 4. BACKEND PROCESSING (ManufacturingService)          │
│    - Validate tenant access                           │
│    - Auto-select warehouse if not provided            │
│    - Generate work order code (WO-{timestamp})        │
│    - Map priority number to string enum               │
│    - Convert date strings to DateTime objects         │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ 5. DATABASE INSERT                                     │
│    INSERT INTO WorkOrder (                             │
│      id, tenantId, code, formulaId, warehouseId,     │
│      quantity, status, priority, notes,               │
│      plannedStart, plannedFinish, completedQuantity   │
│    )                                                   │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ 6. RESPONSE                                            │
│    - Return created work order with all fields        │
│    - Frontend updates UI                              │
│    - User sees confirmation                           │
└────────────────────────────────────────────────────────┘
```

## Field Mapping Patterns

### Pattern 1: Direct Rename
```
Frontend     →    Backend
────────────────────────────
stockQuantity  →  totalQuantity
minStockLevel  →  reorderPoint
bomId          →  formulaId
```

### Pattern 2: Type Conversion
```
Frontend        →    Backend
──────────────────────────────
priority: 3     →   priority: "NORMAL"
startDate: str  →   plannedStart: DateTime
```

### Pattern 3: Nested Object
```
Frontend                    →    Backend
───────────────────────────────────────────
dimensions: {                 →   dimensions: JSON
  length: 30,
  width: 20,
  height: 15,
  unit: "cm"
}
```

### Pattern 4: Computed Fields
```
Backend            →    Frontend
─────────────────────────────────
batchSize          →   yieldQuantity
availableQuantity  →   (calculated from total - reserved)
```

---

**Legend**:
- `→` : One-to-Many relationship
- `◄` : Foreign key reference
- `┌─┐` : Entity box
- `─` : Relationship line

**Generated**: 2026-02-09 13:45 PKT
