import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProductsService', () => {
    let service: ProductsService;
    let prisma: PrismaService;

    const mockPrismaService = {
        product: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };

    const mockTenantId = 'test-tenant-id';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ProductsService>(ProductsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all products for a tenant with mapped fields', async () => {
            const mockProducts = [
                {
                    id: '1',
                    tenantId: mockTenantId,
                    name: 'Test Product',
                    sku: 'TEST-001',
                    code: 'PROD-001',
                    totalQuantity: 100,
                    reorderPoint: 10,
                    category: { id: 'cat-1', name: 'Electronics' },
                },
            ];

            mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

            const result = await service.findAll(mockTenantId);

            expect(result).toBeDefined();
            expect(result[0]).toHaveProperty('stockQuantity', 100);
            expect(result[0]).toHaveProperty('minStockLevel', 10);
            expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
                where: { tenantId: mockTenantId },
                include: { category: true },
                orderBy: { name: 'asc' },
            });
        });
    });

    describe('create', () => {
        it('should create a product with all required fields', async () => {
            const createProductDto = {
                name: 'New Product',
                sku: 'NEW-001',
                code: 'PROD-NEW-001',
                categoryId: 'cat-1',
                basePrice: 100.00,
                costPrice: 75.00,
                salePrice: 120.00,
                stockQuantity: 50,
                minStockLevel: 5,
                weight: 2.5,
                weightUnit: 'kg',
                dimensions: { length: 10, width: 5, height: 5, unit: 'cm' },
                barcode: '1234567890123',
                isActive: true,
                isStockable: true,
                isPurchasable: true,
                isSellable: true,
                trackInventory: true,
            };

            const mockCreatedProduct = {
                ...createProductDto,
                id: 'new-product-id',
                tenantId: mockTenantId,
                totalQuantity: 50,
                availableQuantity: 50,
                reorderPoint: 5,
            };

            mockPrismaService.product.findUnique.mockResolvedValue(null);
            mockPrismaService.product.create.mockResolvedValue(mockCreatedProduct);

            const result = await service.create(mockTenantId, createProductDto);

            expect(result).toBeDefined();
            expect(result.stockQuantity).toBe(50);
            expect(result.minStockLevel).toBe(5);
            expect(mockPrismaService.product.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    totalQuantity: 50,
                    availableQuantity: 50,
                    reorderPoint: 5,
                }),
            });
        });

        it('should throw error if SKU already exists', async () => {
            const createProductDto = {
                name: 'Duplicate Product',
                sku: 'DUP-001',
                code: 'PROD-DUP-001',
            };

            mockPrismaService.product.findUnique.mockResolvedValue({
                id: 'existing-id',
                sku: 'DUP-001',
            });

            await expect(
                service.create(mockTenantId, createProductDto)
            ).rejects.toThrow('Product with this SKU already exists');
        });
    });

    describe('update', () => {
        it('should update product with field mapping', async () => {
            const updateData = {
                name: 'Updated Product',
                stockQuantity: 200,
                minStockLevel: 20,
            };

            const mockUpdatedProduct = {
                id: '1',
                ...updateData,
                totalQuantity: 200,
                reorderPoint: 20,
            };

            mockPrismaService.product.update.mockResolvedValue(mockUpdatedProduct);

            const result = await service.update(mockTenantId, '1', updateData);

            expect(result).toBeDefined();
            expect(result.stockQuantity).toBe(200);
            expect(mockPrismaService.product.update).toHaveBeenCalledWith({
                where: { id: '1', tenantId: mockTenantId },
                data: expect.objectContaining({
                    totalQuantity: 200,
                    availableQuantity: 200,
                    reorderPoint: 20,
                }),
            });
        });
    });

    describe('remove', () => {
        it('should delete a product', async () => {
            const mockDeletedProduct = { id: '1', name: 'Deleted Product' };
            mockPrismaService.product.delete.mockResolvedValue(mockDeletedProduct);

            const result = await service.remove(mockTenantId, '1');

            expect(result).toBeDefined();
            expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
                where: { id: '1', tenantId: mockTenantId },
            });
        });
    });
});
