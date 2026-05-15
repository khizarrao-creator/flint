import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { FinancesModule } from '../finances/finances.module';

@Module({
  imports: [FinancesModule],
  controllers: [TenantsController],
  providers: [TenantsService]
})
export class TenantsModule { }
