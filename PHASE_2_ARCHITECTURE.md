# Phase 2 Architecture Overview

## New Master Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           ProductModal Component                           │ │
│  │                                                            │ │
│  │  States:                                                   │ │
│  │    - brands: Brand[]                                       │ │
│  │    - units: UnitOfMeasure[]                               │ │
│  │    - taxRates: TaxRate[]                                  │ │
│  │    - categories: Category[]                               │ │
│  │                                                            │ │
│  │  On Mount:                                                 │ │
│  │    ┌─────────────────────────────────────────────┐        │ │
│  │    │  Promise.all([                              │        │ │
│  │    │    fetch('/api/brands'),     ────────┐      │        │ │
│  │    │    fetch('/api/units'),      ────────┼──┐   │        │ │
│  │    │    fetch('/api/tax-rates'),  ────────┼──┼─┐ │        │ │
│  │    │    fetch('/api/categories')  ────────┼──┼─┼ │        │ │
│  │    │  ])                                   │  │ │ │        │ │
│  │    └───────────────────────────────────────┼──┼─┼─┘        │ │
│  │                                            │  │ │          │ │
│  │  UI:                                       │  │ │          │ │
│  │    [Category ▼] ◄──────────────────────────┘  │ │          │ │
│  │    [Brand    ▼] ◄─────────────────────────────┘ │          │ │
│  │    [UOM      ▼] ◄───────────────────────────────┘          │ │
│  │    [Tax Rate ▼]                                            │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │ HTTP Requests (with x-tenant-id header)
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND API (NestJS)                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  AppModule (Registered)                   │  │
│  │                                                           │  │
│  │  Imports:                                                │  │
│  │    - BrandsModule      ──┐                              │  │
│  │    - UnitsModule       ──┼─┐                            │  │
│  │    - TaxRatesModule    ──┼─┼─┐                          │  │
│  │    - ProductsModule      │ │ │                          │  │
│  │                          │ │ │                          │  │
│  │  Middleware:             │ │ │                          │  │
│  │    TenantMiddleware ◄────┴─┴─┴─ (Applied to all)       │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────┐   ┌─────────────┐   ┌──────────────┐         │
│  │BrandsModule │   │UnitsModule  │   │TaxRatesModule│         │
│  ├─────────────┤   ├─────────────┤   ├──────────────┤         │
│  │Controller   │   │Controller   │   │Controller    │         │
│  │Service      │   │Service      │   │Service       │         │
│  └──────┬──────┘   └──────┬──────┘   └──────┬───────┘         │
│         │                 │                  │                  │
│         │ PrismaService   │                  │                  │
│         └─────────────────┴──────────────────┘                  │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE (PostgreSQL)                        │
│                                                                  │
│  ┌──────────┐   ┌───────────────┐   ┌──────────┐              │
│  │  Tenant  │   │  Product      │   │ Category │              │
│  ├──────────┤   ├───────────────┤   ├──────────┤              │
│  │ id       │◄──┤ tenantId      │   │ id       │              │
│  │ name     │   │ categoryId    │──►│ tenantId │              │
│  └──────────┘   │ brandId       │──┐└──────────┘              │
│                 │ uomId         │─┐│                            │
│                 │ taxRateId     │┐││                            │
│                 │ sku           ││││                            │
│                 │ code          ││││                            │
│                 └───────────────┘│││                            │
│                                  │││                            │
│  ┌──────────────────┐            │││                            │
│  │  Brand (NEW!)    │◄───────────┘││                            │
│  ├──────────────────┤             ││                            │
│  │ id               │             ││                            │
│  │ tenantId ────────┼─────────────┘│                            │
│  │ name             │              │                            │
│  │ logo             │              │                            │
│  │ description      │              │                            │
│  │ website          │              │                            │
│  │ isActive         │              │                            │
│  └──────────────────┘              │                            │
│                                    │                            │
│  ┌──────────────────┐              │                            │
│  │ UnitOfMeasure    │◄─────────────┘                            │
│  │     (NEW!)       │                                           │
│  ├──────────────────┤                                           │
│  │ id               │                                           │
│  │ tenantId ────────┼───────────────┐                           │
│  │ name             │               │                           │
│  │ code             │               │                           │
│  │ symbol           │               │                           │
│  │ category         │               │                           │
│  │ baseUnit         │               │                           │
│  │ conversion       │               │                           │
│  │ isActive         │               │                           │
│  └──────────────────┘               │                           │
│                                     │                           │
│  ┌──────────────────┐               │                           │
│  │  TaxRate (NEW!)  │◄──────────────┘                           │
│  ├──────────────────┤                                           │
│  │ id               │                                           │
│  │ tenantId         │                                           │
│  │ name             │                                           │
│  │ code             │                                           │
│  │ rate             │ (Decimal 5,3)                            │
│  │ isCompound       │                                           │
│  │ isActive         │                                           │
│  │ effectiveFrom    │ (DateTime)                               │
│  │ effectiveTo      │ (DateTime, nullable)                     │
│  └──────────────────┘                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## API Endpoints Created

```
POST   /api/v1/brands              Create brand
GET    /api/v1/brands              List brands (active only)
GET    /api/v1/brands/:id          Get single brand
PUT    /api/v1/brands/:id          Update brand
DELETE /api/v1/brands/:id          Delete brand

POST   /api/v1/units               Create UOM
GET    /api/v1/units               List UOMs (active only)
GET    /api/v1/units/:id           Get single UOM
PUT    /api/v1/units/:id           Update UOM
DELETE /api/v1/units/:id           Delete UOM

POST   /api/v1/tax-rates           Create tax rate
GET    /api/v1/tax-rates           List tax rates (currently valid)
GET    /api/v1/tax-rates/:id       Get single tax rate
PUT    /api/v1/tax-rates/:id       Update tax rate
DELETE /api/v1/tax-rates/:id       Delete tax rate
```

## Data Flow: Creating a Product with Full Master Data

```
┌──────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                            │
│    Opens ProductModal → Automatically fetches master data│
└─────────────────┬────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────┐
│ 2. PARALLEL API CALLS                                     │
│    GET /api/brands      → [Apple, Samsung, Dell, ...]   │
│    GET /api/units       → [KG, G, L, PCS, ...]           │
│    GET /api/tax-rates   → [VAT 20%, GST 18%, ...]        │
│    GET /api/categories  → [Electronics, Food, ...]       │
└─────────────────┬────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────┐
│ 3. DROPDOWNS POPULATED                                    │
│    Category:   [Electronics ▼]                           │
│    Brand:      [Apple ▼]                                 │
│    UOM:        [Pieces (PCS) ▼]                          │
│    Tax Rate:   [VAT Standard (20%) ▼]                    │
└─────────────────┬────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────┐
│ 4. USER FILLS FORM                                        │
│    Name: "iPhone 15 Pro"                                 │
│    SKU: "IPHONE-15-PRO"                                  │
│    Category: Electronics                                 │
│    Brand: Apple                                          │
│    UOM: Pieces (PCS)                                     │
│    Tax Rate: VAT Standard (20%)                          │
│    Price: $999                                           │
└─────────────────┬────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────┐
│ 5. FORM SUBMISSION                                        │
│    POST /api/products                                    │
│    {                                                      │
│      name: "iPhone 15 Pro",                              │
│      sku: "IPHONE-15-PRO",                               │
│      categoryId: "cat-electronics-uuid",                 │
│      brandId: "brand-apple-uuid",                        │
│      uomId: "uom-pcs-uuid",                              │
│      taxRateId: "tax-vat-standard-uuid",                 │
│      basePrice: 999,                                     │
│      ...                                                  │
│    }                                                      │
└─────────────────┬────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────┐
│ 6. BACKEND VALIDATION                                     │
│    ✅ Tenant exists                                      │
│    ✅ Category/Brand/UOM/Tax belong to tenant            │
│    ✅ SKU is unique                                      │
│    ✅ Required fields present                            │
└─────────────────┬────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────┐
│ 7. DATABASE INSERT                                        │
│    INSERT INTO Product (                                 │
│      id, tenantId, name, sku,                           │
│      categoryId, brandId, uomId, taxRateId,             │
│      basePrice, ...                                      │
│    )                                                      │
│    VALUES (...)                                          │
└─────────────────┬────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────┐
│ 8. RESPONSE & UI UPDATE                                   │
│    Product created successfully!                         │
│    → Modal closes                                        │
│    → Product list refreshes                              │
│    → New product visible with brand badge                │
└──────────────────────────────────────────────────────────┘
```

## Master Data Relationships

```
Product
  ├─► Category (required)
  │     └─ name, code
  │
  ├─► Brand (optional)
  │     └─ name, logo, website
  │
  ├─► UnitOfMeasure (optional)
  │     └─ name, code, symbol, conversion
  │
  └─► TaxRate (optional)
        └─ name, code, rate, effectiveFrom/To
```

## Benefits of New Architecture

### 1. **Centralized Master Data**
✅ Single source of truth for brands, units, and tax rates
✅ Reusable across all products
✅ Easy to maintain and update

### 2. **Multi-Tenant Isolation**
✅ Each tenant has their own brands, units, tax rates
✅ No data leakage between tenants
✅ Middleware enforces isolation automatically

### 3. **Performance Optimization**
✅ Parallel loading of all dropdown data
✅ Active-only filtering reduces response size
✅ Indexed queries for fast lookups

### 4. **Data Integrity**
✅ Foreign key constraints ensure valid references
✅ Validation at API layer
✅ Empty strings converted to null for optional fields

### 5. **Extensibility**
✅ Easy to add new master data types
✅ Consistent pattern across all modules
✅ Follows NestJS best practices

---

**Architecture Document**  
Phase 2 - February 9, 2026
