import { Module } from '@nestjs/common';
import { DocTypesController } from './doctypes.controller';
import { DocTypesService } from './doctypes.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [DocTypesController],
    providers: [DocTypesService],
    exports: [DocTypesService]
})
export class DocTypesModule { }
