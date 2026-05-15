import { Test, TestingModule } from '@nestjs/testing';
import { ManufacturingService } from './manufacturing.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ManufacturingService', () => {
    let service: ManufacturingService;
    let prisma: PrismaService;

    const mockPrismaService = {
        formula: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        formulaItem: {
            deleteMany: jest.fn(),
            createMany: jest.fn(),
        },
        workOrder: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        warehouse: {
            findFirst: jest.fn(),
        },
        $transaction: jest.fn(),
    };

    const mockTenantId = 'test-tenant-id';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManufacturingService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ManufacturingService>(ManufacturingService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAllFormulas', () => {
        it('should return all formulas with mapped yieldQuantity', async () => {
            const mockFormulas = [
                {
                    id: 'formula-1',
                    tenantId: mockTenantId,
                    name: 'Test Formula',
                    code: 'BOM-001',
                    productId: 'prod-1',
                    batchSize: 100,
                    yield: 95.5,
                    items: [],
                },
            ];

            mockPrismaService.formula.findMany.mockResolvedValue(mockFormulas);

            const result = await service.findAllFormulas(mockTenantId);

            expect(result).toBeDefined();
            expect(result[0]).toHaveProperty('yieldQuantity', 100);
            expect(result[0]).toHaveProperty('yield', 95.5);
        });
    });

    describe('createFormula', () => {
        it('should create a formula with all required fields', async () => {
            const createFormulaDto = {
                name: 'New Formula',
                code: 'BOM-NEW',
                productId: 'prod-1',
                type: 'MANUFACTURING',
                yieldQuantity: 50,
                yieldPercentage: 100,
                description: 'Test formula description',
                items: [
                    {
                        productId: 'raw-1',
                        quantity: 10,
                        unitCost: 5.5,
                    },
                    {
                        productId: 'raw-2',
                        quantity: 20,
                        unitCost: 3.25,
                    },
                ],
            };

            const mockCreatedFormula = {
                id: 'new-formula-id',
                tenantId: mockTenantId,
                ...createFormulaDto,
                batchSize: 50,
                items: createFormulaDto.items.map((item, idx) => ({
                    ...item,
                    cost: item.unitCost,
                    sequence: idx + 1,
                    id: `item-${idx}`,
                })),
            };

            mockPrismaService.formula.create.mockResolvedValue(mockCreatedFormula);

            const result = await service.createFormula(mockTenantId, createFormulaDto);

            expect(result).toBeDefined();
            expect(mockPrismaService.formula.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    code: 'BOM-NEW',
                    batchSize: 50,
                    items: {
                        create: expect.arrayContaining([
                            expect.objectContaining({
                                productId: 'raw-1',
                                quantity: 10,
                                cost: 5.5,
                                sequence: 1,
                            }),
                            expect.objectContaining({
                                productId: 'raw-2',
                                quantity: 20,
                                cost: 3.25,
                                sequence: 2,
                            }),
                        ]),
                    },
                }),
                include: { items: true },
            });
        });

        it('should auto-generate code if not provided', async () => {
            const createFormulaDto = {
                name: 'Auto Code Formula',
                productId: 'prod-1',
                yieldQuantity: 10,
                items: [],
            };

            mockPrismaService.formula.create.mockResolvedValue({
                id: 'formula-id',
                ...createFormulaDto,
            });

            await service.createFormula(mockTenantId, createFormulaDto);

            expect(mockPrismaService.formula.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        code: expect.stringMatching(/^BOM-\d+$/),
                    }),
                })
            );
        });
    });

    describe('updateFormula', () => {
        it('should update formula and replace items with correct mapping', async () => {
            const updateData = {
                name: 'Updated Formula',
                yieldQuantity: 75,
                items: [
                    {
                        productId: 'raw-1',
                        quantity: 15,
                        unitCost: 6.0,
                    },
                ],
            };

            const mockUpdatedFormula = {
                id: 'formula-1',
                name: 'Updated Formula',
                batchSize: 75,
                items: [
                    {
                        id: 'item-1',
                        productId: 'raw-1',
                        quantity: 15,
                        cost: 6.0,
                        sequence: 1,
                    },
                ],
            };

            // Mock the transaction callback
            mockPrismaService.$transaction = jest.fn().mockImplementation(async (callback) => {
                const tx = {
                    formula: {
                        update: jest.fn().mockResolvedValue(mockUpdatedFormula),
                        findUnique: jest.fn().mockResolvedValue(mockUpdatedFormula),
                    },
                    formulaItem: {
                        deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
                        createMany: jest.fn().mockResolvedValue({ count: 1 }),
                    },
                };
                return callback(tx);
            });

            const result = await service.updateFormula(mockTenantId, 'formula-1', updateData);

            expect(result).toBeDefined();
            expect(result.yieldQuantity).toBe(75);
        });
    });

    describe('createWorkOrder', () => {
        it('should create work order with all schema fields', async () => {
            const createWorkOrderDto = {
                code: 'WO-001',
                bomId: 'formula-1',
                productId: 'prod-1',
                quantity: 100,
                warehouseId: 'wh-1',
                priority: 3,
                notes: 'Urgent production',
                startDate: '2026-02-10',
                dueDate: '2026-02-15',
            };

            const mockCreatedWorkOrder = {
                id: 'wo-1',
                tenantId: mockTenantId,
                ...createWorkOrderDto,
                status: 'PLANNED',
            };

            mockPrismaService.workOrder.create.mockResolvedValue(mockCreatedWorkOrder);

            const result = await service.createWorkOrder(mockTenantId, createWorkOrderDto);

            expect(result).toBeDefined();
            expect(mockPrismaService.workOrder.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    code: 'WO-001',
                    formulaId: 'formula-1', // backend uses formulaId
                    warehouseId: 'wh-1',
                    priority: '3', // converted to string
                    notes: 'Urgent production',
                }),
            });
        });

        it('should use first active warehouse if warehouseId not provided', async () => {
            const createWorkOrderDto = {
                bomId: 'formula-1',
                productId: 'prod-1',
                quantity: 50,
            };

            mockPrismaService.warehouse.findFirst.mockResolvedValue({
                id: 'default-wh',
                name: 'Main Warehouse',
                isActive: true,
            });

            mockPrismaService.workOrder.create.mockResolvedValue({
                id: 'wo-1',
                ...createWorkOrderDto,
                warehouseId: 'default-wh',
            });

            await service.createWorkOrder(mockTenantId, createWorkOrderDto);

            expect(mockPrismaService.warehouse.findFirst).toHaveBeenCalledWith({
                where: { tenantId: mockTenantId, isActive: true },
                orderBy: { createdAt: 'asc' },
            });

            expect(mockPrismaService.workOrder.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    warehouseId: 'default-wh',
                }),
            });
        });
    });
});
