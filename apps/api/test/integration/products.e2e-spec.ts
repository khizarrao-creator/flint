import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('Products API Integration Tests (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    const mockTenantId = 'test-tenant-e2e';
    const testHeaders = {
        'x-tenant-id': mockTenantId,
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        prisma = app.get<PrismaService>(PrismaService);

        // Clean up any existing test data
        await prisma.product.deleteMany({ where: { tenantId: mockTenantId } });
        await prisma.category.deleteMany({ where: { tenantId: mockTenantId } });
    });

    afterAll(async () => {
        // Clean up test data
        await prisma.product.deleteMany({ where: { tenantId: mockTenantId } });
        await prisma.category.deleteMany({ where: { tenantId: mockTenantId } });
        await app.close();
    });

    describe('POST /products', () => {
        it('should create a product with all schema fields', async () => {
            const productData = {
                name: 'Integration Test Product',
                sku: 'INT-TEST-001',
                code: 'PROD-INT-001',
                description: 'Test product for integration testing',
                barcode: '1234567890123',
                upc: '123456789012',
                basePrice: 100.99,
                costPrice: 75.50,
                salePrice: 125.00,
                minPrice: 90.00,
                maxPrice: 150.00,
                stockQuantity: 50,
                minStockLevel: 10,
                reorderQuantity: 25,
                weight: 2.5,
                weightUnit: 'kg',
                dimensions: {
                    length: 30,
                    width: 20,
                    height: 15,
                    unit: 'cm',
                },
                shelfLifeDays: 365,
                isActive: true,
                isStockable: true,
                isPurchasable: true,
                isSellable: true,
                isManufactured: false,
                trackInventory: true,
                trackSerial: false,
                trackBatch: false,
            };

            const response = await request(app.getHttpServer())
                .post('/products')
                .set(testHeaders)
                .send(productData)
                .expect(201);

            expect(response.body).toMatchObject({
                name: productData.name,
                sku: productData.sku,
                code: productData.code,
                stockQuantity: productData.stockQuantity,
                minStockLevel: productData.minStockLevel,
                weight: Number(productData.weight),
                weightUnit: productData.weightUnit,
            });

            // Verify backend mapping
            const dbProduct = await prisma.product.findUnique({
                where: { id: response.body.id },
            });

            expect(dbProduct).toBeDefined();
            expect(dbProduct.totalQuantity).toEqual(productData.stockQuantity);
            expect(dbProduct.reorderPoint).toEqual(productData.minStockLevel);
            expect(dbProduct.dimensions).toEqual(productData.dimensions);
        });

        it('should reject duplicate SKU', async () => {
            const duplicateData = {
                name: 'Duplicate Product',
                sku: 'INT-TEST-001', // Same as above
                code: 'PROD-DUP-001',
                basePrice: 50,
                costPrice: 30,
                salePrice: 70,
            };

            await request(app.getHttpServer())
                .post('/products')
                .set(testHeaders)
                .send(duplicateData)
                .expect(400); // Should return BadRequest
        });
    });

    describe('GET /products', () => {
        it('should return all products with mapped fields', async () => {
            const response = await request(app.getHttpServer())
                .get('/products')
                .set(testHeaders)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);

            const product = response.body[0];
            expect(product).toHaveProperty('stockQuantity');
            expect(product).toHaveProperty('minStockLevel');
        });
    });

    describe('PUT /products/:id', () => {
        it('should update a product with field mapping', async () => {
            // First create a product
            const createResponse = await request(app.getHttpServer())
                .post('/products')
                .set(testHeaders)
                .send({
                    name: 'Update Test Product',
                    sku: 'UPD-TEST-001',
                    code: 'PROD-UPD-001',
                    basePrice: 100,
                    costPrice: 75,
                    salePrice: 125,
                    stockQuantity: 100,
                    minStockLevel: 20,
                })
                .expect(201);

            const productId = createResponse.body.id;

            // Update the product
            const updateData = {
                name: 'Updated Product Name',
                stockQuantity: 150,
                minStockLevel: 30,
                salePrice: 135.00,
            };

            const updateResponse = await request(app.getHttpServer())
                .put(`/products/${productId}`)
                .set(testHeaders)
                .send(updateData)
                .expect(200);

            expect(updateResponse.body.name).toBe(updateData.name);
            expect(updateResponse.body.stockQuantity).toBe(updateData.stockQuantity);
            expect(updateResponse.body.minStockLevel).toBe(updateData.minStockLevel);

            // Verify backend mapping
            const dbProduct = await prisma.product.findUnique({
                where: { id: productId },
            });

            expect(dbProduct.totalQuantity).toEqual(updateData.stockQuantity);
            expect(dbProduct.reorderPoint).toEqual(updateData.minStockLevel);
        });
    });

    describe('DELETE /products/:id', () => {
        it('should delete a product', async () => {
            // Create a product to delete
            const createResponse = await request(app.getHttpServer())
                .post('/products')
                .set(testHeaders)
                .send({
                    name: 'Delete Test Product',
                    sku: 'DEL-TEST-001',
                    code: 'PROD-DEL-001',
                    basePrice: 50,
                    costPrice: 30,
                    salePrice: 70,
                })
                .expect(201);

            const productId = createResponse.body.id;

            // Delete the product
            await request(app.getHttpServer())
                .delete(`/products/${productId}`)
                .set(testHeaders)
                .expect(200);

            // Verify it's deleted
            const dbProduct = await prisma.product.findUnique({
                where: { id: productId },
            });

            expect(dbProduct).toBeNull();
        });
    });
});
