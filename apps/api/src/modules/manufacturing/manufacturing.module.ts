import { Module } from '@nestjs/common';
import { ManufacturingService } from './manufacturing.service';
import { ManufacturingController } from './manufacturing.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductsModule } from '../products/products.module';

@Module({
    imports: [ProductsModule],
    controllers: [ManufacturingController],
    providers: [ManufacturingService, PrismaService],
})
export class ManufacturingModule { }
