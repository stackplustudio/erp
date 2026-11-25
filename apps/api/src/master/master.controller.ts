import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { MasterService } from './master.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  private resolveTenant(user: AuthUser): string {
    return user.tenantId || 'tenant_demo_fmcg_01';
  }

  // ── Products ──────────────────────────────────────────────────────────────
  @Get('products')
  getProducts(
    @CurrentUser() user: AuthUser,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.masterService.getProducts(
      this.resolveTenant(user),
      search,
      category,
      page,
      limit,
      user.role,
    );
  }

  @Get('products/barcode/:barcode')
  getProductByBarcode(
    @CurrentUser() user: AuthUser,
    @Param('barcode') barcode: string,
  ) {
    return this.masterService.getProductByBarcode(
      this.resolveTenant(user),
      barcode,
      user.role,
    );
  }

  @Get('products/:id')
  getProductById(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.masterService.getProductById(
      this.resolveTenant(user),
      id,
      user.role,
    );
  }

  @Post('products')
  createProduct(@CurrentUser() user: AuthUser, @Body() dto: CreateProductDto) {
    return this.masterService.createProduct(this.resolveTenant(user), dto);
  }

  // ── Warehouses ────────────────────────────────────────────────────────────
  @Get('warehouses')
  getWarehouses(@CurrentUser() user: AuthUser) {
    return this.masterService.getWarehouses(this.resolveTenant(user));
  }

  // ── Customers ─────────────────────────────────────────────────────────────
  @Get('customers')
  getCustomers(
    @CurrentUser() user: AuthUser,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.masterService.getCustomers(
      this.resolveTenant(user),
      search,
      page,
      limit,
    );
  }

  @Post('customers')
  createCustomer(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.masterService.createCustomer(this.resolveTenant(user), dto);
  }

  // ── Suppliers ─────────────────────────────────────────────────────────────
  @Get('suppliers')
  getSuppliers(
    @CurrentUser() user: AuthUser,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.masterService.getSuppliers(
      this.resolveTenant(user),
      search,
      page,
      limit,
    );
  }

  @Post('suppliers')
  createSupplier(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateSupplierDto,
  ) {
    return this.masterService.createSupplier(this.resolveTenant(user), dto);
  }

  // ── Price Tiers ───────────────────────────────────────────────────────────
  @Get('price-tiers')
  getPriceTiers(@CurrentUser() user: AuthUser) {
    return this.masterService.getPriceTiers(this.resolveTenant(user));
  }
}
