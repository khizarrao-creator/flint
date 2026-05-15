import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ProductsModule } from './modules/products/products.module';
import { CustomersModule } from './modules/customers/customers.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { AuthModule } from './modules/auth/auth.module';
import { FinancesModule } from './modules/finances/finances.module';
import { ManufacturingModule } from './modules/manufacturing/manufacturing.module';
import { AssetsModule } from './modules/assets/assets.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { UnitsModule } from './modules/units/units.module';
import { TaxRatesModule } from './modules/tax-rates/tax-rates.module';
import { DocTypesModule } from './modules/doctypes/doctypes.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    PrismaModule,
    OrdersModule,
    DashboardModule,
    ProductsModule,
    CustomersModule,
    TenantsModule,
    AuthModule,
    FinancesModule,
    ManufacturingModule,
    AssetsModule,
    CategoriesModule,
    BrandsModule,
    UnitsModule,
    TaxRatesModule,
    DocTypesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {
  // TenantMiddleware has been REMOVED and replaced with JWT-based authentication
  // Tenant ID is now extracted from validated JWT tokens, not client headers
  // This prevents cross-tenant data access attacks
}
