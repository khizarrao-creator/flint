# Phase 2 Quick Reference

## 🚀 What Was Added

**3 New Backend Modules**:
- `/api/brands` - Product brand management
- `/api/units` - Units of measure (UOM)
- `/api/tax-rates` - Tax rate management

**Frontend Integration**:
- ProductModal now has Brand, UOM, and Tax Rate dropdowns
- All master data loads automatically when modal opens

**Master Data**:
- 4 brands seeded (Apple, Samsung, Dell, Generic)
- 10 units seeded (weight, volume, length, quantity)
- 5 tax rates seeded (VAT, GST, Sales Tax, Exempt)

---

## 📝 Quick Commands

### Run Master Data Seed
```bash
cd packages/database
npx tsx prisma/seeds/seed-master-data.ts
```

### View Database
```bash
cd packages/database
npx prisma studio
```

### Run Tests
```bash
cd apps/api
npm test
```

### Start Development Server
```bash
# From project root
npm run dev
```

---

## 🔍 Testing the New Features

### 1. Test Brand Dropdown
1. Navigate to Products page
2. Click "Add Product"
3. Look for "Brand" dropdown (below Category)
4. Should see: Apple, Samsung, Dell, Generic

### 2. Test UOM Dropdown
1. In Product Modal
2. Look for "Unit of Measure" dropdown
3. Should see: Kilogram (KG), Gram (G), Liter (L), etc.

### 3. Test Tax Rate Dropdown
1. In Product Modal
2. Look for "Tax Rate" dropdown
3. Should see: VAT Standard (20%), GST (18%), etc.

### 4. Create Product with All Fields
```
Name: Test Product
SKU: TEST-001
Category: (select any)
Brand: Apple
Unit of Measure: Pieces (PCS)
Tax Rate: VAT Standard (20%)
Base Price: 100
```

### 5. Verify in Database
```bash
npx prisma studio
# Navigate to Product table
# Find "Test Product"
# Verify brandId, uomId, taxRateId are set
```

---

## 🐛 Troubleshooting

### "Foreign key constraint violated: Brand_tenantId_fkey"
**Solution**: Run the seed script to create the tenant
```bash
npx tsx prisma/seeds/seed-master-data.ts
```

### Dropdowns are empty
**Solution**: Check API responses
```bash
# Test brands endpoint
curl http://localhost:3001/api/v1/brands -H "x-tenant-id: tenant-demo-001"

# Test units endpoint
curl http://localhost:3001/api/v1/units -H "x-tenant-id: tenant-demo-001"

# Test tax rates endpoint
curl http://localhost:3001/api/v1/tax-rates -H "x-tenant-id: tenant-demo-001"
```

### TypeScript compilation error on Warehouse
**Fixed**: Changed `orderBy: { createdAt: 'asc' }` to `orderBy: { name: 'asc' }`

---

## 📊 API Testing with cURL

### Create a Brand
```bash
curl -X POST http://localhost:3001/api/v1/brands \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant-demo-001" \
  -d '{
    "name": "Sony",
    "description": "Consumer electronics",
    "website": "https://www.sony.com",
    "isActive": true
  }'
```

### List All Brands
```bash
curl http://localhost:3001/api/v1/brands \
  -H "x-tenant-id: tenant-demo-001"
```

### Create a UOM
```bash
curl -X POST http://localhost:3001/api/v1/units \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant-demo-001" \
  -d '{
    "name": "Ton",
    "code": "TON",
    "symbol": "t",
    "category": "Weight",
    "baseUnit": false,
    "conversion": 1000,
    "isActive": true
  }'
```

### Create a Tax Rate
```bash
curl -X POST http://localhost:3001/api/v1/tax-rates \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant-demo-001" \
  -d '{
    "name": "Import Tax",
    "code": "IMPORT",
    "rate": 0.15,
    "isCompound": false,
    "isActive": true,
    "effectiveFrom": "2026-01-01T00:00:00Z"
  }'
```

---

## 📂 Files Modified/Created

### Backend
```
apps/api/src/
├── modules/
│   ├── brands/
│   │   ├── brands.controller.ts ⭐ NEW
│   │   ├── brands.service.ts    ⭐ NEW
│   │   └── brands.module.ts     ⭐ NEW
│   ├── units/
│   │   ├── units.controller.ts  ⭐ NEW
│   │   ├── units.service.ts     ⭐ NEW
│   │   └── units.module.ts      ⭐ NEW
│   ├── tax-rates/
│   │   ├── tax-rates.controller.ts ⭐ NEW
│   │   ├── tax-rates.service.ts    ⭐ NEW
│   │   └── tax-rates.module.ts     ⭐ NEW
│   └── manufacturing/
│       └── manufacturing.service.ts ✏️ FIXED
└── app.module.ts ✏️ UPDATED
```

### Frontend
```
apps/web/
└── components/
    └── products/
        └── product-modal.tsx ✏️ UPDATED
```

### Database
```
packages/database/
└── prisma/
    └── seeds/
        └── seed-master-data.ts ⭐ NEW
```

### Documentation
```
PHASE_2_SUMMARY.md        ⭐ NEW
PHASE_2_ARCHITECTURE.md   ⭐ NEW
PHASE_2_QUICK_REFERENCE.md ⭐ NEW (this file)
```

---

## ✅ Verification Checklist

- [x] All backend modules registered in app.module.ts
- [x] Tenant middleware applied to new controllers
- [x] Master data seed script runs successfully
- [x] TypeScript compilation passes (no errors)
- [x] All previous tests still passing (11/11)
- [x] Frontend dropdowns populated with data
- [x] Optional fields handle null values correctly
- [x] Products can be created with new master data references

---

## 🎯 Next Phase Preview (Phase 3)

**Planned Features**:
1. Unit tests for new modules (brands, units, tax-rates)
2. E2E integration tests
3. Image upload system for products
4. Rich text editor for long descriptions
5. Formula version control
6. Work order user assignment

**Estimated Effort**: 2-3 development days

---

## 💡 Pro Tips

1. **Always use the tenant ID**: All API requests require `x-tenant-id` header
2. **Seed data is idempotent**: Safe to run multiple times
3. **Empty dropdowns mean "optional"**: Fields like brand, UOM, tax are not required
4. **Check Prisma Studio**: Best way to verify database state
5. **Master data first**: Create brands/units/taxes before creating products

---

## 🔗 Related Documentation

- [Phase 2 Summary](./PHASE_2_SUMMARY.md) - Detailed implementation report
- [Phase 2 Architecture](./PHASE_2_ARCHITECTURE.md) - Data flow diagrams
- [Schema Coverage Report](./SCHEMA_COVERAGE_REPORT.md) - Field coverage metrics
- [Code Review Summary](./CODE_REVIEW_SUMMARY.md) - Overall project status
- [Implementation Checklist](./IMPLEMENTATION_CHECKLIST.md) - Progress tracking

---

**Last Updated**: 2026-02-09 14:45 PKT  
**Status**: ✅ Phase 2 Complete - Ready for Testing
