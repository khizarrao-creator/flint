# API Architecture & Specifications

## API Design Philosophy

### REST + GraphQL Hybrid Approach

**REST API**: For CRUD operations and traditional workflows
**GraphQL**: For complex dashboard queries and mobile app

**Why Hybrid?**
- ✅ REST is simpler for standard operations (Create Invoice, Update Product)
- ✅ GraphQL eliminates over-fetching for dashboards (fetch only needed fields)
- ✅ External integrations expect REST; internal apps benefit from GraphQL

---

## REST API Structure

### Base URL Pattern
```
Production: https://api.erpapp.com/v1
Staging: https://api-staging.erpapp.com/v1
```

### Authentication
**Bearer Token (JWT)** in `Authorization` header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Tenant Identification**:
- **Option 1**: Subdomain parsing (`acme.erpapp.com` → tenant_id lookup)
- **Option 2**: Custom header `X-Tenant-ID: <uuid>`
- **Option 3**: Extracted from JWT claims (`tenant_id` field)

**Chosen**: JWT claims (most secure, no DNS dependency)

---

## Core API Endpoints

### 1. **Products API**

#### List Products
```http
GET /v1/products?page=1&limit=50&search=laptop&category=electronics&active=true
```

**Response**:
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "sku": "LAP-001",
      "name": "Dell XPS 13",
      "description": "Ultrabook with 16GB RAM",
      "category": "electronics",
      "sale_price": 1299.99,
      "purchase_price": 999.99,
      "stock_total": 45,
      "stock_available": 40,
      "is_active": true,
      "created_at": "2026-01-15T10:30:00Z",
      "updated_at": "2026-02-01T14:22:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 234,
    "pages": 5
  }
}
```

#### Create Product
```http
POST /v1/products
Content-Type: application/json

{
  "sku": "LAP-002",
  "name": "MacBook Pro 14",
  "description": "M3 Pro chip, 18GB RAM",
  "category": "electronics",
  "unit_of_measure": "pcs",
  "sale_price": 1999.99,
  "purchase_price": 1599.99,
  "tax_rate": 18.0,
  "track_inventory": true,
  "stock_alert_threshold": 5
}
```

**Response** (201 Created):
```json
{
  "id": "660f9500-f30c-52e5-b827-557766551111",
  "sku": "LAP-002",
  "name": "MacBook Pro 14",
  "created_at": "2026-02-06T12:45:00Z"
}
```

---

### 2. **Sales Orders API**

#### Create Sales Order
```http
POST /v1/sales-orders
Content-Type: application/json

{
  "customer_id": "770fa600-a41d-63f6-c938-668877662222",
  "order_date": "2026-02-06",
  "delivery_date": "2026-02-10",
  "items": [
    {
      "product_id": "550e8400-e29b-41d4-a716-446655440000",
      "warehouse_id": "880fb700-b52e-74a7-d049-779988773333",
      "quantity": 2,
      "unit_price": 1299.99
    }
  ],
  "notes": "Customer requested express delivery"
}
```

**Response** (201 Created):
```json
{
  "id": "990fc800-c63f-85b8-e15a-88aa99884444",
  "order_number": "SO-2026-0001",
  "customer": {
    "id": "770fa600-a41d-63f6-c938-668877662222",
    "name": "Acme Corp"
  },
  "status": "pending",
  "payment_status": "unpaid",
  "subtotal": 2599.98,
  "tax_amount": 467.996,
  "total_amount": 3067.976,
  "created_at": "2026-02-06T12:50:00Z"
}
```

#### Get Sales Order
```http
GET /v1/sales-orders/990fc800-c63f-85b8-e15a-88aa99884444
```

**Response**:
```json
{
  "id": "990fc800-c63f-85b8-e15a-88aa99884444",
  "order_number": "SO-2026-0001",
  "customer": {
    "id": "770fa600-a41d-63f6-c938-668877662222",
    "name": "Acme Corp",
    "email": "orders@acme.com"
  },
  "order_date": "2026-02-06",
  "delivery_date": "2026-02-10",
  "status": "confirmed",
  "payment_status": "unpaid",
  "items": [
    {
      "id": "aa0fd900-d74a-96c9-f26b-99bb00aa5555",
      "product": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "sku": "LAP-001",
        "name": "Dell XPS 13"
      },
      "quantity": 2,
      "unit_price": 1299.99,
      "tax_rate": 18.0,
      "line_total": 2599.98
    }
  ],
  "subtotal": 2599.98,
  "tax_amount": 467.996,
  "shipping_cost": 0,
  "total_amount": 3067.976,
  "notes": "Customer requested express delivery",
  "created_by": {
    "id": "bb0fea00-e85b-a7da-a37c-aaccbb116666",
    "name": "John Smith"
  },
  "created_at": "2026-02-06T12:50:00Z",
  "updated_at": "2026-02-06T13:15:00Z"
}
```

---

### 3. **Inventory API**

#### Adjust Stock
```http
POST /v1/inventory/adjust
Content-Type: application/json

{
  "product_id": "550e8400-e29b-41d4-a716-446655440000",
  "warehouse_id": "880fb700-b52e-74a7-d049-779988773333",
  "adjustment_type": "add", // or 'remove'
  "quantity": 10,
  "reason": "Stock received from supplier",
  "batch_number": "BATCH-2026-02-001",
  "expiry_date": "2027-02-01"
}
```

**Response** (200 OK):
```json
{
  "product": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Dell XPS 13"
  },
  "warehouse": {
    "id": "880fb700-b52e-74a7-d049-779988773333",
    "name": "Main Warehouse"
  },
  "previous_quantity": 45,
  "new_quantity": 55,
  "adjustment": 10,
  "adjusted_at": "2026-02-06T13:00:00Z"
}
```

---

### 4. **Reports API**

#### Sales Report
```http
GET /v1/reports/sales?from=2026-01-01&to=2026-01-31&group_by=day
```

**Response**:
```json
{
  "period": {
    "from": "2026-01-01",
    "to": "2026-01-31"
  },
  "summary": {
    "total_orders": 156,
    "total_revenue": 125340.50,
    "average_order_value": 803.72,
    "cancelled_orders": 5
  },
  "breakdown": [
    {
      "date": "2026-01-01",
      "order_count": 12,
      "revenue": 9840.20
    },
    {
      "date": "2026-01-02",
      "order_count": 8,
      "revenue": 6120.00
    }
  ]
}
```

---

## GraphQL Schema

### Queries

```graphql
type Query {
  # Dashboard Overview
  dashboard: Dashboard!
  
  # Products
  products(
    page: Int = 1
    limit: Int = 50
    search: String
    category: String
  ): ProductConnection!
  
  product(id: ID!): Product
  
  # Sales Orders
  salesOrders(
    page: Int = 1
    limit: Int = 50
    status: OrderStatus
    customerId: ID
  ): SalesOrderConnection!
  
  salesOrder(id: ID!): SalesOrder
  
  # Customers
  customers(
    page: Int = 1
    limit: Int = 50
    search: String
  ): CustomerConnection!
  
  # Analytics
  salesAnalytics(from: Date!, to: Date!): SalesAnalytics!
  inventoryAlerts: [InventoryAlert!]!
}

type Dashboard {
  revenue: RevenueSummary!
  orders: OrderSummary!
  inventory: InventorySummary!
  topProducts: [Product!]!
  recentActivities: [Activity!]!
  pendingPayments: PaymentSummary!
}

type RevenueSummary {
  today: Float!
  thisWeek: Float!
  thisMonth: Float!
  trend: Float! # Percentage change from last period
}

type OrderSummary {
  pending: Int!
  confirmed: Int!
  shipped: Int!
  delivered: Int!
}

type InventorySummary {
  totalProducts: Int!
  lowStockCount: Int!
  outOfStockCount: Int!
  totalValue: Float!
}

type Product {
  id: ID!
  sku: String!
  name: String!
  description: String
  category: String
  salePrice: Float!
  purchasePrice: Float
  stockTotal: Int!
  stockAvailable: Int!
  isActive: Boolean!
  createdAt: DateTime!
}

type SalesOrder {
  id: ID!
  orderNumber: String!
  customer: Customer!
  orderDate: Date!
  deliveryDate: Date
  status: OrderStatus!
  paymentStatus: PaymentStatus!
  items: [SalesOrderItem!]!
  subtotal: Float!
  taxAmount: Float!
  totalAmount: Float!
  notes: String
  createdBy: User!
  createdAt: DateTime!
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  UNPAID
  PARTIAL
  PAID
}
```

### Mutations

```graphql
type Mutation {
  # Products
  createProduct(input: CreateProductInput!): Product!
  updateProduct(id: ID!, input: UpdateProductInput!): Product!
  deleteProduct(id: ID!): Boolean!
  
  # Sales Orders
  createSalesOrder(input: CreateSalesOrderInput!): SalesOrder!
  updateSalesOrderStatus(id: ID!, status: OrderStatus!): SalesOrder!
  
  # Inventory
  adjustInventory(input: AdjustInventoryInput!): InventoryAdjustment!
  
  # Payments
  recordPayment(input: RecordPaymentInput!): Payment!
}

input CreateProductInput {
  sku: String!
  name: String!
  description: String
  category: String
  salePrice: Float!
  purchasePrice: Float
  taxRate: Float
  trackInventory: Boolean
  stockAlertThreshold: Int
}

input CreateSalesOrderInput {
  customerId: ID!
  orderDate: Date!
  deliveryDate: Date
  items: [SalesOrderItemInput!]!
  notes: String
}

input SalesOrderItemInput {
  productId: ID!
  warehouseId: ID!
  quantity: Int!
  unitPrice: Float!
}
```

**Example GraphQL Query (Mobile App Dashboard)**:
```graphql
query MobileDashboard {
  dashboard {
    revenue {
      today
      thisWeek
      thisMonth
      trend
    }
    orders {
      pending
      confirmed
      shipped
    }
    inventory {
      lowStockCount
      outOfStockCount
    }
    topProducts {
      id
      name
      stockTotal
    }
  }
  inventoryAlerts {
    product {
      name
      sku
    }
    currentStock
    threshold
  }
}
```

**Response**:
```json
{
  "data": {
    "dashboard": {
      "revenue": {
        "today": 15340.50,
        "thisWeek": 89234.20,
        "thisMonth": 325890.75,
        "trend": 12.5
      },
      "orders": {
        "pending": 8,
        "confirmed": 23,
        "shipped": 15
      },
      "inventory": {
        "lowStockCount": 5,
        "outOfStockCount": 2
      },
      "topProducts": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Dell XPS 13",
          "stockTotal": 45
        }
      ]
    },
    "inventoryAlerts": [
      {
        "product": {
          "name": "iPhone 15 Pro",
          "sku": "PHN-001"
        },
        "currentStock": 3,
        "threshold": 10
      }
    ]
  }
}
```

---

## Webhook System for Integrations

### Event Types

| Event | Payload | Use Case |
|-------|---------|----------|
| `order.created` | SalesOrder object | Trigger email, sync to POS |
| `order.confirmed` | SalesOrder object | Start fulfillment workflow |
| `invoice.paid` | Invoice object | Update accounting software |
| `stock.low` | Product + current stock | Trigger auto-purchase order |
| `product.created` | Product object | Sync to e-commerce platform |

### Webhook Registration (REST API)

```http
POST /v1/webhooks
Content-Type: application/json

{
  "url": "https://external-system.com/erp-webhook",
  "events": ["order.created", "order.confirmed"],
  "secret": "whsec_abc123..." // For signature verification
}
```

### Webhook Payload Format

```json
{
  "event": "order.created",
  "timestamp": "2026-02-06T13:30:00Z",
  "tenant_id": "990fc800-c63f-85b8-e15a-88aa99884444",
  "data": {
    "id": "770fa600-a41d-63f6-c938-668877662222",
    "order_number": "SO-2026-0002",
    "customer": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Tech Solutions Inc"
    },
    "total_amount": 5420.00,
    "status": "pending"
  },
  "signature": "sha256=abc123..." // HMAC for verification
}
```

---

## Rate Limiting & Quotas

| Plan | API Calls/Hour | Webhook Events/Day | Concurrent Requests |
|------|----------------|--------------------|--------------------|
| **Free** | 100 | 500 | 2 |
| **Starter** | 1,000 | 5,000 | 10 |
| **Professional** | 10,000 | 50,000 | 50 |
| **Enterprise** | Unlimited | Unlimited | 200 |

**Rate Limit Headers**:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1675689600
```

---

## API Versioning Strategy

**URL-Based Versioning**: `/v1/`, `/v2/`

**Deprecation Policy**:
1. New version released (e.g., `/v2/products`)
2. 6 months overlap period (both `/v1/` and `/v2/` work)
3. Deprecation notice sent to all API users
4. `/v1/` turned off after 6 months

---

## Error Handling

### Standard Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The SKU 'LAP-001' already exists",
    "details": {
      "field": "sku",
      "constraint": "unique"
    },
    "request_id": "req_abc123",
    "timestamp": "2026-02-06T13:45:00Z"
  }
}
```

### Error Codes

| HTTP Code | Error Code | Meaning |
|-----------|------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input data |
| 401 | `UNAUTHORIZED` | Missing or invalid auth token |
| 403 | `FORBIDDEN` | User lacks permission |
| 404 | `NOT_FOUND` | Resource doesn't exist |
| 409 | `CONFLICT` | Duplicate resource (e.g., SKU exists) |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Database or service down |

---

## API Documentation & Developer Portal

### Tools
- **Swagger/OpenAPI**: Auto-generated from NestJS decorators
- **Redoc**: Beautiful, interactive API docs
- **Postman Collection**: Downloadable collection for testing

### Developer Portal Features
1. **API Key Management**: Generate, rotate, and revoke keys
2. **Sandbox Environment**: Test APIs without affecting production data
3. **Webhook Logs**: View delivery status and retry history
4. **Usage Analytics**: Track API call volume and error rates
5. **Code Samples**: Pre-built examples in cURL, JavaScript, Python, PHP

**Example Documentation URL**:
```
https://developers.erpapp.com/docs/api/v1/products
```

---

## Performance Benchmarks

| Endpoint | Target Response Time | Load Capacity |
|----------|---------------------|---------------|
| `GET /products` | < 100ms | 1,000 req/sec |
| `POST /sales-orders` | < 200ms | 500 req/sec |
| `GET /reports/sales` | < 500ms | 100 req/sec |
| GraphQL Dashboard | < 150ms | 500 req/sec |

**Optimization Techniques**:
- ✅ Redis caching for product catalog (TTL: 5 minutes)
- ✅ Database connection pooling (PgBouncer)
- ✅ CDN for static assets (CloudFront)
- ✅ Gzip compression for API responses
